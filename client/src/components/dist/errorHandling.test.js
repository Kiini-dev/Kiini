"use strict";
exports.__esModule = true;
var vitest_1 = require("vitest");
var errorHandling_1 = require("./errorHandling");
vitest_1.describe('Error Handling Utilities', function () {
    vitest_1.describe('categorizeError', function () {
        vitest_1.it('categorizes network errors', function () {
            var error = { message: 'Network Error' };
            var result = errorHandling_1.categorizeError(error);
            vitest_1.expect(result.code).toBe(errorHandling_1.ErrorCategory.NETWORK_ERROR);
            vitest_1.expect(result.userMessage).toBe('Network connection failed. Please check your connection and try again');
            vitest_1.expect(result.retryable).toBe(true);
        });
        vitest_1.it('categorizes HTTP 400 as validation error', function () {
            var error = { response: { status: 400, data: { errors: { field: 'Invalid' } } } };
            var result = errorHandling_1.categorizeError(error);
            vitest_1.expect(result.code).toBe(errorHandling_1.ErrorCategory.VALIDATION_ERROR);
            vitest_1.expect(result.details).toEqual({ field: 'Invalid' });
        });
        vitest_1.it('categorizes HTTP 403 as permission denied', function () {
            var error = { response: { status: 403 } };
            var result = errorHandling_1.categorizeError(error);
            vitest_1.expect(result.code).toBe(errorHandling_1.ErrorCategory.PERMISSION_DENIED);
            vitest_1.expect(result.retryable).toBe(false);
        });
        vitest_1.it('categorizes HTTP 404 as not found', function () {
            var error = { response: { status: 404 } };
            var result = errorHandling_1.categorizeError(error);
            vitest_1.expect(result.code).toBe(errorHandling_1.ErrorCategory.NOT_FOUND);
            vitest_1.expect(result.severity).toBe('warning');
        });
        vitest_1.it('categorizes HTTP 409 as conflict', function () {
            var error = { response: { status: 409 } };
            var result = errorHandling_1.categorizeError(error);
            vitest_1.expect(result.code).toBe(errorHandling_1.ErrorCategory.CONFLICT);
            vitest_1.expect(result.retryable).toBe(true);
        });
        vitest_1.it('categorizes HTTP 500 as server error', function () {
            var error = { response: { status: 500 } };
            var result = errorHandling_1.categorizeError(error);
            vitest_1.expect(result.code).toBe(errorHandling_1.ErrorCategory.SERVER_ERROR);
            vitest_1.expect(result.retryable).toBe(true);
        });
        vitest_1.it('categorizes timeout errors', function () {
            var error = { code: 'ETIMEDOUT' };
            var result = errorHandling_1.categorizeError(error);
            vitest_1.expect(result.code).toBe(errorHandling_1.ErrorCategory.NETWORK_ERROR);
            vitest_1.expect(result.message).toBe('Request timeout. Please check your connection and try again');
        });
        vitest_1.it('categorizes duplicate field errors', function () {
            var error = { message: 'Duplicate field name' };
            var result = errorHandling_1.categorizeError(error);
            vitest_1.expect(result.code).toBe(errorHandling_1.ErrorCategory.DUPLICATE_FIELD);
        });
        vitest_1.it('returns unknown for uncategorized errors', function () {
            var error = { message: 'Some random error' };
            var result = errorHandling_1.categorizeError(error);
            vitest_1.expect(result.code).toBe(errorHandling_1.ErrorCategory.UNKNOWN);
            vitest_1.expect(result.severity).toBe('error');
            vitest_1.expect(result.retryable).toBe(false);
        });
        vitest_1.it('returns existing categorized error unchanged', function () {
            var existingError = {
                code: errorHandling_1.ErrorCategory.VALIDATION_ERROR,
                message: 'Test',
                userMessage: 'Test message',
                severity: 'error',
                retryable: false
            };
            var result = errorHandling_1.categorizeError(existingError);
            vitest_1.expect(result).toEqual(existingError);
        });
    });
    vitest_1.describe('validateFieldName', function () {
        vitest_1.it('validates required field name', function () {
            var result = errorHandling_1.validateFieldName('');
            vitest_1.expect(result.valid).toBe(false);
            vitest_1.expect(result.error).toBe('Field name is required');
        });
        vitest_1.it('validates field name format', function () {
            var result = errorHandling_1.validateFieldName('123invalid');
            vitest_1.expect(result.valid).toBe(false);
            vitest_1.expect(result.error).toContain('must start with letter or underscore');
        });
        vitest_1.it('validates field name length', function () {
            var longName = 'a'.repeat(65);
            var result = errorHandling_1.validateFieldName(longName);
            vitest_1.expect(result.valid).toBe(false);
            vitest_1.expect(result.error).toContain('64 characters or less');
        });
        vitest_1.it('validates duplicate names', function () {
            var result = errorHandling_1.validateFieldName('testField', ['existingField', 'testField']);
            vitest_1.expect(result.valid).toBe(false);
            vitest_1.expect(result.error).toBe('A field with this name already exists');
        });
        vitest_1.it('accepts valid field names', function () {
            var validNames = ['fieldName', '_privateField', 'field123', 'My_Field'];
            validNames.forEach(function (name) {
                var result = errorHandling_1.validateFieldName(name);
                vitest_1.expect(result.valid).toBe(true);
            });
        });
    });
    vitest_1.describe('validateFieldLabel', function () {
        vitest_1.it('validates required field label', function () {
            var result = errorHandling_1.validateFieldLabel('');
            vitest_1.expect(result.valid).toBe(false);
            vitest_1.expect(result.error).toBe('Field label is required');
        });
        vitest_1.it('validates field label length', function () {
            var longLabel = 'a'.repeat(256);
            var result = errorHandling_1.validateFieldLabel(longLabel);
            vitest_1.expect(result.valid).toBe(false);
            vitest_1.expect(result.error).toContain('255 characters or less');
        });
        vitest_1.it('accepts valid field labels', function () {
            var result = errorHandling_1.validateFieldLabel('Valid Label');
            vitest_1.expect(result.valid).toBe(true);
        });
    });
    vitest_1.describe('validateSelectOptions', function () {
        vitest_1.it('requires options for select fields', function () {
            var result = errorHandling_1.validateSelectOptions([], 'select');
            vitest_1.expect(result.valid).toBe(false);
            vitest_1.expect(result.error).toBe('At least one option is required for select fields');
        });
        vitest_1.it('validates maximum options', function () {
            var options = Array(101).fill('option');
            var result = errorHandling_1.validateSelectOptions(options, 'select');
            vitest_1.expect(result.valid).toBe(false);
            vitest_1.expect(result.error).toBe('Maximum 100 options allowed');
        });
        vitest_1.it('prevents duplicate options', function () {
            var result = errorHandling_1.validateSelectOptions(['Option 1', 'option 1', 'Option 2'], 'select');
            vitest_1.expect(result.valid).toBe(false);
            vitest_1.expect(result.error).toBe('Duplicate options are not allowed');
        });
        vitest_1.it('accepts valid options', function () {
            var result = errorHandling_1.validateSelectOptions(['Option 1', 'Option 2', 'Option 3'], 'select');
            vitest_1.expect(result.valid).toBe(true);
        });
        vitest_1.it('skips validation for non-select fields', function () {
            var result = errorHandling_1.validateSelectOptions([], 'text');
            vitest_1.expect(result.valid).toBe(true);
        });
    });
    vitest_1.describe('validateFieldValue', function () {
        vitest_1.it('allows empty values', function () {
            var result = errorHandling_1.validateFieldValue('', 'text');
            vitest_1.expect(result.valid).toBe(true);
        });
        vitest_1.it('validates text field constraints', function () {
            var result = errorHandling_1.validateFieldValue('short', 'text', { minLength: 10 });
            vitest_1.expect(result.valid).toBe(false);
            vitest_1.expect(result.error).toContain('Minimum 10 characters required');
        });
        vitest_1.it('validates number fields', function () {
            var result = errorHandling_1.validateFieldValue('not-a-number', 'number');
            vitest_1.expect(result.valid).toBe(false);
            vitest_1.expect(result.error).toBe('Must be a number');
        });
        vitest_1.it('validates email format', function () {
            var result = errorHandling_1.validateFieldValue('invalid-email', 'email');
            vitest_1.expect(result.valid).toBe(false);
            vitest_1.expect(result.error).toBe('Must be a valid email address');
        });
        vitest_1.it('validates URL format', function () {
            var result = errorHandling_1.validateFieldValue('not-a-url', 'url');
            vitest_1.expect(result.valid).toBe(false);
            vitest_1.expect(result.error).toBe('Must be a valid URL');
        });
        vitest_1.it('validates date format', function () {
            var result = errorHandling_1.validateFieldValue('not-a-date', 'date');
            vitest_1.expect(result.valid).toBe(false);
            vitest_1.expect(result.error).toBe('Must be a valid date');
        });
        vitest_1.it('accepts valid values', function () {
            var testCases = [
                { value: 'valid text', type: 'text' },
                { value: '123', type: 'number' },
                { value: 'test@example.com', type: 'email' },
                { value: '+1234567890', type: 'phone' },
                { value: '2023-01-01', type: 'date' },
                { value: 'https://example.com', type: 'url' },
            ];
            testCases.forEach(function (_a) {
                var value = _a.value, type = _a.type;
                var result = errorHandling_1.validateFieldValue(value, type);
                vitest_1.expect(result.valid).toBe(true);
            });
        });
    });
    vitest_1.describe('createErrorNotification', function () {
        vitest_1.it('creates notification with retry action for retryable errors', function () {
            var _a;
            var error = {
                code: errorHandling_1.ErrorCategory.NETWORK_ERROR,
                message: 'Network failed',
                userMessage: 'Network error',
                severity: 'error',
                retryable: true
            };
            var notification = errorHandling_1.createErrorNotification(error, 'create');
            vitest_1.expect(notification.title).toBe('Error');
            vitest_1.expect(notification.type).toBe('error');
            vitest_1.expect(notification.dismissible).toBe(true);
            vitest_1.expect((_a = notification.action) === null || _a === void 0 ? void 0 : _a.label).toBe('Retry');
        });
        vitest_1.it('creates notification without retry for non-retryable errors', function () {
            var error = {
                code: errorHandling_1.ErrorCategory.VALIDATION_ERROR,
                message: 'Validation failed',
                userMessage: 'Check input',
                severity: 'error',
                retryable: false
            };
            var notification = errorHandling_1.createErrorNotification(error);
            vitest_1.expect(notification.action).toBeUndefined();
        });
    });
    vitest_1.describe('formatValidationErrors', function () {
        vitest_1.it('formats string errors', function () {
            var errors = { field1: 'Error message' };
            var result = errorHandling_1.formatValidationErrors(errors);
            vitest_1.expect(result).toEqual({ field1: 'Error message' });
        });
        vitest_1.it('formats array errors', function () {
            var errors = { field1: ['First error', 'Second error'] };
            var result = errorHandling_1.formatValidationErrors(errors);
            vitest_1.expect(result).toEqual({ field1: 'First error' });
        });
    });
    vitest_1.describe('getActionErrorMessage', function () {
        vitest_1.it('formats messages for different actions', function () {
            var error = {
                code: errorHandling_1.ErrorCategory.VALIDATION_ERROR,
                userMessage: 'Check input',
                severity: 'error',
                retryable: false
            };
            var createMessage = errorHandling_1.getActionErrorMessage('create', error);
            var updateMessage = errorHandling_1.getActionErrorMessage('update', error);
            var deleteMessage = errorHandling_1.getActionErrorMessage('delete', error);
            vitest_1.expect(createMessage).toContain('creating');
            vitest_1.expect(updateMessage).toContain('updating');
            vitest_1.expect(deleteMessage).toContain('deleting');
        });
        vitest_1.it('provides specific messages for duplicate fields', function () {
            var error = {
                code: errorHandling_1.ErrorCategory.DUPLICATE_FIELD,
                userMessage: 'Already exists',
                severity: 'error',
                retryable: false
            };
            var message = errorHandling_1.getActionErrorMessage('create', error);
            vitest_1.expect(message).toBe('Cannot create field: Already exists');
        });
    });
});
