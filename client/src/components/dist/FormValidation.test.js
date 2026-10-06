"use strict";
exports.__esModule = true;
var vitest_1 = require("vitest");
var errorHandling_1 = require("./errorHandling");
/**
 * Form Validation Tests
 * Comprehensive tests for form validation functions
 */
vitest_1.describe('Form Validation System', function () {
    vitest_1.describe('Field Name Validation', function () {
        vitest_1.it('should validate valid field names', function () {
            var testCases = [
                'firstName',
                'first_name',
                '_private',
                'field123',
                'CONSTANT_NAME',
                'camelCaseField',
            ];
            testCases.forEach(function (name) {
                var result = errorHandling_1.validateFieldName(name, []);
                vitest_1.expect(result.valid).toBe(true, name + " should be valid");
            });
        });
        vitest_1.it('should reject invalid field names', function () {
            var testCases = [
                { name: '', reason: 'empty' },
                { name: ' ', reason: 'whitespace only' },
                { name: '123field', reason: 'starts with number' },
                { name: 'field-name', reason: 'contains hyphen' },
                { name: 'field.name', reason: 'contains dot' },
                { name: 'field name', reason: 'contains space' },
                { name: 'field@name', reason: 'contains special char' },
                { name: 'a'.repeat(65), reason: 'exceeds 64 chars' },
            ];
            testCases.forEach(function (_a) {
                var name = _a.name, reason = _a.reason;
                var result = errorHandling_1.validateFieldName(name, []);
                vitest_1.expect(result.valid).toBe(false, reason + ": \"" + name + "\" should be invalid");
                vitest_1.expect(result.error).toBeDefined();
            });
        });
        vitest_1.it('should detect duplicate field names case-insensitively', function () {
            var existingNames = ['fieldName', 'anotherField'];
            var testCases = [
                { name: 'fieldName', shouldBeDuplicate: true },
                { name: 'FIELDNAME', shouldBeDuplicate: true },
                { name: 'fieldname', shouldBeDuplicate: true },
                { name: 'newField', shouldBeDuplicate: false },
            ];
            testCases.forEach(function (_a) {
                var name = _a.name, shouldBeDuplicate = _a.shouldBeDuplicate;
                var result = errorHandling_1.validateFieldName(name, existingNames);
                if (shouldBeDuplicate) {
                    vitest_1.expect(result.valid).toBe(false);
                }
                else {
                    vitest_1.expect(result.valid).toBe(true);
                }
            });
        });
    });
    vitest_1.describe('Field Label Validation', function () {
        vitest_1.it('should validate valid field labels', function () {
            var testCases = [
                'First Name',
                'Customer Name & Email',
                'Price (USD)',
                'Q1 2024 Forecast',
                'Email / Contact Info',
                '123 Main Street',
            ];
            testCases.forEach(function (label) {
                var result = errorHandling_1.validateFieldLabel(label);
                vitest_1.expect(result.valid).toBe(true, "\"" + label + "\" should be valid");
            });
        });
        vitest_1.it('should reject invalid field labels', function () {
            var testCases = [
                { label: '', reason: 'empty' },
                { label: ' ', reason: 'whitespace only' },
                { label: 'a'.repeat(256), reason: 'exceeds 255 chars' },
            ];
            testCases.forEach(function (_a) {
                var label = _a.label, reason = _a.reason;
                var result = errorHandling_1.validateFieldLabel(label);
                vitest_1.expect(result.valid).toBe(false, reason + ": should be invalid");
                vitest_1.expect(result.error).toBeDefined();
            });
        });
        vitest_1.it('should allow up to 255 characters', function () {
            var label = 'a'.repeat(255);
            var result = errorHandling_1.validateFieldLabel(label);
            vitest_1.expect(result.valid).toBe(true);
        });
    });
    vitest_1.describe('Select Options Validation', function () {
        vitest_1.it('should skip validation for non-select types', function () {
            var fieldTypes = ['text', 'number', 'email', 'date', 'checkbox'];
            fieldTypes.forEach(function (type) {
                var result = errorHandling_1.validateSelectOptions([], type);
                vitest_1.expect(result.valid).toBe(true, type + " should skip validation");
            });
        });
        vitest_1.it('should require at least one option for select fields', function () {
            var result = errorHandling_1.validateSelectOptions([], 'select');
            vitest_1.expect(result.valid).toBe(false);
            vitest_1.expect(result.error).toContain('At least one');
        });
        vitest_1.it('should require at least one option for multiSelect fields', function () {
            var result = errorHandling_1.validateSelectOptions([], 'multiSelect');
            vitest_1.expect(result.valid).toBe(false);
        });
        vitest_1.it('should accept valid options', function () {
            var options = ['Option 1', 'Option 2', 'Option 3'];
            var result = errorHandling_1.validateSelectOptions(options, 'select');
            vitest_1.expect(result.valid).toBe(true);
        });
        vitest_1.it('should allow up to 100 options', function () {
            var options = Array.from({ length: 100 }, function (_, i) { return "Option " + (i + 1); });
            var result = errorHandling_1.validateSelectOptions(options, 'select');
            vitest_1.expect(result.valid).toBe(true);
        });
        vitest_1.it('should reject more than 100 options', function () {
            var options = Array.from({ length: 101 }, function (_, i) { return "Option " + (i + 1); });
            var result = errorHandling_1.validateSelectOptions(options, 'select');
            vitest_1.expect(result.valid).toBe(false);
            vitest_1.expect(result.error).toContain('Maximum 100');
        });
        vitest_1.it('should detect duplicate options case-insensitively', function () {
            var result = errorHandling_1.validateSelectOptions(['Option', 'option', 'OPTION'], 'select');
            vitest_1.expect(result.valid).toBe(false);
            vitest_1.expect(result.error).toContain('Duplicate');
        });
        vitest_1.it('should allow unique options with different cases', function () {
            var result = errorHandling_1.validateSelectOptions(['Option1', 'Option2', 'option3'], 'select');
            vitest_1.expect(result.valid).toBe(true);
        });
    });
    vitest_1.describe('Field Value Validation', function () {
        vitest_1.describe('Text Field', function () {
            vitest_1.it('should validate text values', function () {
                var result = errorHandling_1.validateFieldValue('Some text', 'text');
                vitest_1.expect(result.valid).toBe(true);
            });
            vitest_1.it('should reject non-string values', function () {
                var result = errorHandling_1.validateFieldValue(123, 'text');
                vitest_1.expect(result.valid).toBe(false);
            });
            vitest_1.it('should enforce minimum length', function () {
                var result = errorHandling_1.validateFieldValue('hi', 'text', { minLength: 3 });
                vitest_1.expect(result.valid).toBe(false);
            });
            vitest_1.it('should enforce maximum length', function () {
                var result = errorHandling_1.validateFieldValue('toolongtext', 'text', { maxLength: 5 });
                vitest_1.expect(result.valid).toBe(false);
            });
        });
        vitest_1.describe('Number Field', function () {
            vitest_1.it('should validate numeric values', function () {
                var validCases = [42, '42', 0, -5, 3.14];
                validCases.forEach(function (value) {
                    var result = errorHandling_1.validateFieldValue(value, 'number');
                    vitest_1.expect(result.valid).toBe(true);
                });
            });
            vitest_1.it('should reject non-numeric values', function () {
                var invalidCases = ['abc', 'not_a_number', { value: 123 }];
                invalidCases.forEach(function (value) {
                    var result = errorHandling_1.validateFieldValue(value, 'number');
                    vitest_1.expect(result.valid).toBe(false, "Value " + JSON.stringify(value) + " should be rejected");
                });
            });
            vitest_1.it('should enforce minimum value', function () {
                var result = errorHandling_1.validateFieldValue(5, 'number', { min: 10 });
                vitest_1.expect(result.valid).toBe(false);
            });
            vitest_1.it('should enforce maximum value', function () {
                var result = errorHandling_1.validateFieldValue(15, 'number', { max: 10 });
                vitest_1.expect(result.valid).toBe(false);
            });
        });
        vitest_1.describe('Email Field', function () {
            vitest_1.it('should validate email addresses', function () {
                var validEmails = [
                    'user@example.com',
                    'test.email@test.co.uk',
                    'first+last@domain.com',
                ];
                validEmails.forEach(function (email) {
                    var result = errorHandling_1.validateFieldValue(email, 'email');
                    vitest_1.expect(result.valid).toBe(true);
                });
            });
            vitest_1.it('should reject invalid email addresses', function () {
                var invalidEmails = [
                    'invalid',
                    'user@',
                    '@example.com',
                    'user name@example.com',
                ];
                invalidEmails.forEach(function (email) {
                    var result = errorHandling_1.validateFieldValue(email, 'email');
                    vitest_1.expect(result.valid).toBe(false);
                });
            });
        });
        vitest_1.describe('Phone Field', function () {
            vitest_1.it('should validate phone numbers', function () {
                var validPhones = [
                    '+1-234-567-8900',
                    '1234567890',
                    '(123) 456-7890',
                    '+1 (123) 456-7890',
                ];
                validPhones.forEach(function (phone) {
                    var result = errorHandling_1.validateFieldValue(phone, 'phone');
                    vitest_1.expect(result.valid).toBe(true);
                });
            });
            vitest_1.it('should reject invalid phone numbers', function () {
                var invalidPhones = ['abc', 'user@example', 'no-numbers-here'];
                invalidPhones.forEach(function (phone) {
                    var result = errorHandling_1.validateFieldValue(phone, 'phone');
                    vitest_1.expect(result.valid).toBe(false);
                });
            });
        });
        vitest_1.describe('URL Field', function () {
            vitest_1.it('should validate URLs', function () {
                var validURLs = [
                    'https://example.com',
                    'http://example.com/path',
                    'https://example.com:8080/path?query=value',
                ];
                validURLs.forEach(function (url) {
                    var result = errorHandling_1.validateFieldValue(url, 'url');
                    vitest_1.expect(result.valid).toBe(true);
                });
            });
            vitest_1.it('should reject invalid URLs', function () {
                var invalidURLs = [
                    'not a url',
                    'example.com',
                    'ht!tp://example.com',
                ];
                invalidURLs.forEach(function (url) {
                    var result = errorHandling_1.validateFieldValue(url, 'url');
                    vitest_1.expect(result.valid).toBe(false);
                });
            });
        });
        vitest_1.describe('Date Field', function () {
            vitest_1.it('should validate dates', function () {
                var validDates = [
                    '2024-01-01',
                    '2024-12-31',
                    new Date('2024-01-01'),
                ];
                validDates.forEach(function (date) {
                    var result = errorHandling_1.validateFieldValue(date, 'date');
                    vitest_1.expect(result.valid).toBe(true);
                });
            });
            vitest_1.it('should reject invalid dates', function () {
                var invalidDates = ['invalid', 'not-a-date', '2024-13-01'];
                invalidDates.forEach(function (date) {
                    var result = errorHandling_1.validateFieldValue(date, 'date');
                    vitest_1.expect(result.valid).toBe(false);
                });
            });
        });
        vitest_1.it('should allow empty values across all types', function () {
            var fieldTypes = ['text', 'number', 'email', 'phone', 'date', 'url'];
            var emptyValues = [null, undefined, ''];
            fieldTypes.forEach(function (type) {
                emptyValues.forEach(function (value) {
                    var result = errorHandling_1.validateFieldValue(value, type);
                    vitest_1.expect(result.valid).toBe(true, type + " should allow " + value);
                });
            });
        });
    });
    vitest_1.describe('Validation Edge Cases', function () {
        vitest_1.it('should handle whitespace trimming in field names', function () {
            var result = errorHandling_1.validateFieldName('  fieldName  ', []);
            vitest_1.expect(result.valid).toBe(true);
        });
        vitest_1.it('should handle whitespace trimming in field labels', function () {
            var result = errorHandling_1.validateFieldLabel('  Field Label  ');
            vitest_1.expect(result.valid).toBe(true);
        });
        vitest_1.it('should handle special characters in labels', function () {
            var result = errorHandling_1.validateFieldLabel('Special!@#$%^&*()Characters');
            vitest_1.expect(result.valid).toBe(true);
        });
        vitest_1.it('should handle unicode characters in labels', function () {
            var result = errorHandling_1.validateFieldLabel('Café • Naïve • Résumé');
            vitest_1.expect(result.valid).toBe(true);
        });
        vitest_1.it('should preserve case sensitivity for field names', function () {
            var result = errorHandling_1.validateFieldName('CamelCaseField', []);
            vitest_1.expect(result.valid).toBe(true);
        });
    });
});
