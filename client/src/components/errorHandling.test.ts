import { describe, it, expect } from 'vitest';
import {
  categorizeError,
  ErrorCategory,
  validateFieldName,
  validateFieldLabel,
  validateSelectOptions,
  validateFieldValue,
  createErrorNotification,
  formatValidationErrors,
  getActionErrorMessage,
} from './errorHandling';

describe('Error Handling Utilities', () => {
  describe('categorizeError', () => {
    it('categorizes network errors', () => {
      const error = { message: 'Network Error' };
      const result = categorizeError(error);

      expect(result.code).toBe(ErrorCategory.NETWORK_ERROR);
      expect(result.userMessage).toBe('Network connection failed. Please check your connection and try again');
      expect(result.retryable).toBe(true);
    });

    it('categorizes HTTP 400 as validation error', () => {
      const error = { response: { status: 400, data: { errors: { field: 'Invalid' } } } };
      const result = categorizeError(error);

      expect(result.code).toBe(ErrorCategory.VALIDATION_ERROR);
      expect(result.details).toEqual({ field: 'Invalid' });
    });

    it('categorizes HTTP 403 as permission denied', () => {
      const error = { response: { status: 403 } };
      const result = categorizeError(error);

      expect(result.code).toBe(ErrorCategory.PERMISSION_DENIED);
      expect(result.retryable).toBe(false);
    });

    it('categorizes HTTP 404 as not found', () => {
      const error = { response: { status: 404 } };
      const result = categorizeError(error);

      expect(result.code).toBe(ErrorCategory.NOT_FOUND);
      expect(result.severity).toBe('warning');
    });

    it('categorizes HTTP 409 as conflict', () => {
      const error = { response: { status: 409 } };
      const result = categorizeError(error);

      expect(result.code).toBe(ErrorCategory.CONFLICT);
      expect(result.retryable).toBe(true);
    });

    it('categorizes HTTP 500 as server error', () => {
      const error = { response: { status: 500 } };
      const result = categorizeError(error);

      expect(result.code).toBe(ErrorCategory.SERVER_ERROR);
      expect(result.retryable).toBe(true);
    });

    it('categorizes timeout errors', () => {
      const error = { code: 'ETIMEDOUT' };
      const result = categorizeError(error);

      expect(result.code).toBe(ErrorCategory.NETWORK_ERROR);
      expect(result.message).toBe('Request timeout. Please check your connection and try again');
    });

    it('categorizes duplicate field errors', () => {
      const error = { message: 'Duplicate field name' };
      const result = categorizeError(error);

      expect(result.code).toBe(ErrorCategory.DUPLICATE_FIELD);
    });

    it('returns unknown for uncategorized errors', () => {
      const error = { message: 'Some random error' };
      const result = categorizeError(error);

      expect(result.code).toBe(ErrorCategory.UNKNOWN);
      expect(result.severity).toBe('error');
      expect(result.retryable).toBe(false);
    });

    it('returns existing categorized error unchanged', () => {
      const existingError = {
        code: ErrorCategory.VALIDATION_ERROR,
        message: 'Test',
        userMessage: 'Test message',
        severity: 'error' as const,
        retryable: false,
      };
      const result = categorizeError(existingError);

      expect(result).toEqual(existingError);
    });
  });

  describe('validateFieldName', () => {
    it('validates required field name', () => {
      const result = validateFieldName('');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Field name is required');
    });

    it('validates field name format', () => {
      const result = validateFieldName('123invalid');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('must start with letter or underscore');
    });

    it('validates field name length', () => {
      const longName = 'a'.repeat(65);
      const result = validateFieldName(longName);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('64 characters or less');
    });

    it('validates duplicate names', () => {
      const result = validateFieldName('testField', ['existingField', 'testField']);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('A field with this name already exists');
    });

    it('accepts valid field names', () => {
      const validNames = ['fieldName', '_privateField', 'field123', 'My_Field'];
      validNames.forEach(name => {
        const result = validateFieldName(name);
        expect(result.valid).toBe(true);
      });
    });
  });

  describe('validateFieldLabel', () => {
    it('validates required field label', () => {
      const result = validateFieldLabel('');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Field label is required');
    });

    it('validates field label length', () => {
      const longLabel = 'a'.repeat(256);
      const result = validateFieldLabel(longLabel);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('255 characters or less');
    });

    it('accepts valid field labels', () => {
      const result = validateFieldLabel('Valid Label');
      expect(result.valid).toBe(true);
    });
  });

  describe('validateSelectOptions', () => {
    it('requires options for select fields', () => {
      const result = validateSelectOptions([], 'select');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('At least one option is required for select fields');
    });

    it('validates maximum options', () => {
      const options = Array(101).fill('option');
      const result = validateSelectOptions(options, 'select');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Maximum 100 options allowed');
    });

    it('prevents duplicate options', () => {
      const result = validateSelectOptions(['Option 1', 'option 1', 'Option 2'], 'select');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Duplicate options are not allowed');
    });

    it('accepts valid options', () => {
      const result = validateSelectOptions(['Option 1', 'Option 2', 'Option 3'], 'select');
      expect(result.valid).toBe(true);
    });

    it('skips validation for non-select fields', () => {
      const result = validateSelectOptions([], 'text');
      expect(result.valid).toBe(true);
    });
  });

  describe('validateFieldValue', () => {
    it('allows empty values', () => {
      const result = validateFieldValue('', 'text');
      expect(result.valid).toBe(true);
    });

    it('validates text field constraints', () => {
      const result = validateFieldValue('short', 'text', { minLength: 10 });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Minimum 10 characters required');
    });

    it('validates number fields', () => {
      const result = validateFieldValue('not-a-number', 'number');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Must be a number');
    });

    it('validates email format', () => {
      const result = validateFieldValue('invalid-email', 'email');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Must be a valid email address');
    });

    it('validates URL format', () => {
      const result = validateFieldValue('not-a-url', 'url');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Must be a valid URL');
    });

    it('validates date format', () => {
      const result = validateFieldValue('not-a-date', 'date');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Must be a valid date');
    });

    it('accepts valid values', () => {
      const testCases = [
        { value: 'valid text', type: 'text' },
        { value: '123', type: 'number' },
        { value: 'test@example.com', type: 'email' },
        { value: '+1234567890', type: 'phone' },
        { value: '2023-01-01', type: 'date' },
        { value: 'https://example.com', type: 'url' },
      ];

      testCases.forEach(({ value, type }) => {
        const result = validateFieldValue(value, type);
        expect(result.valid).toBe(true);
      });
    });
  });

  describe('createErrorNotification', () => {
    it('creates notification with retry action for retryable errors', () => {
      const error = {
        code: ErrorCategory.NETWORK_ERROR,
        message: 'Network failed',
        userMessage: 'Network error',
        severity: 'error' as const,
        retryable: true,
      };

      const notification = createErrorNotification(error, 'create');

      expect(notification.title).toBe('Error');
      expect(notification.type).toBe('error');
      expect(notification.dismissible).toBe(true);
      expect(notification.action?.label).toBe('Retry');
    });

    it('creates notification without retry for non-retryable errors', () => {
      const error = {
        code: ErrorCategory.VALIDATION_ERROR,
        message: 'Validation failed',
        userMessage: 'Check input',
        severity: 'error' as const,
        retryable: false,
      };

      const notification = createErrorNotification(error);

      expect(notification.action).toBeUndefined();
    });
  });

  describe('formatValidationErrors', () => {
    it('formats string errors', () => {
      const errors = { field1: 'Error message' };
      const result = formatValidationErrors(errors);
      expect(result).toEqual({ field1: 'Error message' });
    });

    it('formats array errors', () => {
      const errors = { field1: ['First error', 'Second error'] };
      const result = formatValidationErrors(errors);
      expect(result).toEqual({ field1: 'First error' });
    });
  });

  describe('getActionErrorMessage', () => {
    it('formats messages for different actions', () => {
      const error = {
        code: ErrorCategory.VALIDATION_ERROR,
        userMessage: 'Check input',
        severity: 'error' as const,
        retryable: false,
      };

      const createMessage = getActionErrorMessage('create', error);
      const updateMessage = getActionErrorMessage('update', error);
      const deleteMessage = getActionErrorMessage('delete', error);

      expect(createMessage).toContain('creating');
      expect(updateMessage).toContain('updating');
      expect(deleteMessage).toContain('deleting');
    });

    it('provides specific messages for duplicate fields', () => {
      const error = {
        code: ErrorCategory.DUPLICATE_FIELD,
        userMessage: 'Already exists',
        severity: 'error' as const,
        retryable: false,
      };

      const message = getActionErrorMessage('create', error);
      expect(message).toBe('Cannot create field: Already exists');
    });
  });
});