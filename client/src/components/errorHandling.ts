/**
 * Error Handling & Categorization Utility for Custom Fields
 * Provides consistent error messaging and categorization
 */

export enum ErrorCategory {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  DUPLICATE_FIELD = 'DUPLICATE_FIELD',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  SERVER_ERROR = 'SERVER_ERROR',
  UNKNOWN = 'UNKNOWN',
}

export interface CategorizedError {
  code: ErrorCategory;
  message: string;
  userMessage: string;
  details?: Record<string, any>;
  severity: 'error' | 'warning' | 'info';
  retryable: boolean;
}

// User-friendly error messages
const ERROR_MESSAGE_MAP: Record<ErrorCategory, string> = {
  [ErrorCategory.VALIDATION_ERROR]: 'Please check your input and try again',
  [ErrorCategory.NETWORK_ERROR]: 'Network connection failed. Please check your connection and try again',
  [ErrorCategory.PERMISSION_DENIED]: 'You do not have permission to perform this action',
  [ErrorCategory.DUPLICATE_FIELD]: 'A field with this name already exists',
  [ErrorCategory.NOT_FOUND]: 'The field you are looking for does not exist',
  [ErrorCategory.CONFLICT]: 'This field has been modified by another user. Please refresh and try again',
  [ErrorCategory.SERVER_ERROR]: 'Server error. Please try again later',
  [ErrorCategory.UNKNOWN]: 'An unexpected error occurred. Please try again',
};

// Error severity classification
const ERROR_SEVERITY_MAP: Record<ErrorCategory, 'error' | 'warning' | 'info'> = {
  [ErrorCategory.VALIDATION_ERROR]: 'error',
  [ErrorCategory.NETWORK_ERROR]: 'error',
  [ErrorCategory.PERMISSION_DENIED]: 'error',
  [ErrorCategory.DUPLICATE_FIELD]: 'error',
  [ErrorCategory.NOT_FOUND]: 'warning',
  [ErrorCategory.CONFLICT]: 'warning',
  [ErrorCategory.SERVER_ERROR]: 'error',
  [ErrorCategory.UNKNOWN]: 'error',
};

// Whether error is retryable
const RETRYABLE_ERRORS: Set<ErrorCategory> = new Set([
  ErrorCategory.NETWORK_ERROR,
  ErrorCategory.SERVER_ERROR,
  ErrorCategory.CONFLICT,
]);

/**
 * Categorize and format API errors
 */
export const categorizeError = (error: any): CategorizedError => {
  // If already categorized, return as is
  if (error?.code && ERROR_MESSAGE_MAP[error.code]) {
    return error;
  }

  let category = ErrorCategory.UNKNOWN;
  let message = error?.message || 'An unexpected error occurred';
  let details: Record<string, any> | undefined;

  // Network errors
  if (isNetworkError(error)) {
    category = ErrorCategory.NETWORK_ERROR;
  }
  // HTTP status codes
  else if (error?.response?.status) {
    const status = error.response.status;

    if (status === 400) {
      category = ErrorCategory.VALIDATION_ERROR;
      details = error.response.data?.errors;
    } else if (status === 401 || status === 403) {
      category = ErrorCategory.PERMISSION_DENIED;
    } else if (status === 404) {
      category = ErrorCategory.NOT_FOUND;
    } else if (status === 409) {
      category = ErrorCategory.CONFLICT;
    } else if (status >= 500) {
      category = ErrorCategory.SERVER_ERROR;
    }

    message = error.response.data?.message || message;
  }
  // Network timeout
  else if (error?.code === 'ETIMEDOUT' || error?.code === 'ECONNABORTED') {
    category = ErrorCategory.NETWORK_ERROR;
    message = 'Request timeout. Please check your connection and try again';
  }
  // Connection refused
  else if (error?.code === 'ECONNREFUSED') {
    category = ErrorCategory.NETWORK_ERROR;
    message = 'Unable to connect to server. Please try again later';
  }

  // Check for duplicate field error
  if (message?.toLowerCase().includes('duplicate')) {
    category = ErrorCategory.DUPLICATE_FIELD;
  }

  return {
    code: category,
    message,
    userMessage: ERROR_MESSAGE_MAP[category],
    severity: ERROR_SEVERITY_MAP[category],
    retryable: RETRYABLE_ERRORS.has(category),
    details,
  };
};

/**
 * Check if error is a network error
 */
const isNetworkError = (error: any): boolean => {
  return (
    !error?.response &&
    (error?.message?.includes('Network') ||
      error?.message?.includes('ENOTFOUND') ||
      error?.message?.includes('ERR_NETWORK'))
  );
};

/**
 * Format validation errors for display
 */
export const formatValidationErrors = (
  errors: Record<string, string>
): Record<string, string> => {
  const formatted: Record<string, string> = {};

  for (const [field, error] of Object.entries(errors)) {
    if (Array.isArray(error)) {
      formatted[field] = error[0];
    } else {
      formatted[field] = error;
    }
  }

  return formatted;
};

/**
 * Get action-specific error message
 */
export const getActionErrorMessage = (
  action: 'create' | 'update' | 'delete' | 'fetch',
  error: CategorizedError
): string => {
  const actionLabel = {
    create: 'creating',
    update: 'updating',
    delete: 'deleting',
    fetch: 'loading',
  }[action];

  if (error.code === ErrorCategory.DUPLICATE_FIELD) {
    return `Cannot create field: ${error.userMessage}`;
  }

  if (error.code === ErrorCategory.VALIDATION_ERROR) {
    return `Validation failed while ${actionLabel} field: ${error.userMessage}`;
  }

  if (error.code === ErrorCategory.PERMISSION_DENIED) {
    return `You don't have permission to ${action} this field`;
  }

  if (error.code === ErrorCategory.CONFLICT) {
    return `Failed to ${action} field: ${error.userMessage}`;
  }

  return `Error ${actionLabel} field: ${error.userMessage}`;
};

/**
 * Create error notification object for display
 */
export interface ErrorNotification {
  id: string;
  title: string;
  message: string;
  type: 'error' | 'warning' | 'info';
  dismissible: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const createErrorNotification = (
  error: CategorizedError,
  action?: 'create' | 'update' | 'delete' | 'fetch'
): ErrorNotification => {
  const actionLabel = action ? ` while ${action}ing field` : '';

  return {
    id: `error-${Date.now()}`,
    title: error.severity === 'error' ? 'Error' : 'Warning',
    message: action
      ? getActionErrorMessage(action, error)
      : error.userMessage,
    type: error.severity,
    dismissible: true,
    action: error.retryable
      ? {
          label: 'Retry',
          onClick: () => {
            // Retry handled by caller
          },
        }
      : undefined,
  };
};

/**
 * Validate field name format
 */
export const validateFieldName = (
  fieldName: string,
  existingNames: string[] = [],
  currentFieldId?: string
): { valid: boolean; error?: string } => {
  if (!fieldName || !fieldName.trim()) {
    return { valid: false, error: 'Field name is required' };
  }

  const trimmed = fieldName.trim();

  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(trimmed)) {
    return {
      valid: false,
      error: 'Field name must start with letter or underscore and contain only alphanumeric characters and underscores',
    };
  }

  if (trimmed.length > 64) {
    return {
      valid: false,
      error: 'Field name must be 64 characters or less',
    };
  }

  // Check for duplicates (excluding current field if updating)
  const isDuplicate = existingNames.some(
    (name) => name.toLowerCase() === trimmed.toLowerCase()
  );

  if (isDuplicate) {
    return {
      valid: false,
      error: 'A field with this name already exists',
    };
  }

  return { valid: true };
};

/**
 * Validate field label
 */
export const validateFieldLabel = (label: string): { valid: boolean; error?: string } => {
  if (!label || !label.trim()) {
    return { valid: false, error: 'Field label is required' };
  }

  if (label.trim().length > 255) {
    return {
      valid: false,
      error: 'Field label must be 255 characters or less',
    };
  }

  return { valid: true };
};

/**
 * Validate select options
 */
export const validateSelectOptions = (
  options: string[],
  fieldType: string
): { valid: boolean; error?: string } => {
  if (!['select', 'multiSelect'].includes(fieldType)) {
    return { valid: true };
  }

  if (!options || options.length === 0) {
    return {
      valid: false,
      error: 'At least one option is required for select fields',
    };
  }

  if (options.length > 100) {
    return {
      valid: false,
      error: 'Maximum 100 options allowed',
    };
  }

  // Check for duplicates
  const uniqueOptions = new Set(options.map((o) => o.toLowerCase()));
  if (uniqueOptions.size !== options.length) {
    return {
      valid: false,
      error: 'Duplicate options are not allowed',
    };
  }

  return { valid: true };
};

/**
 * Validate field value against type constraints
 */
export const validateFieldValue = (
  value: any,
  fieldType: string,
  constraints?: Record<string, any>
): { valid: boolean; error?: string } => {
  if (value === null || value === undefined || value === '') {
    // Allow empty values - required validation happens elsewhere
    return { valid: true };
  }

  switch (fieldType) {
    case 'text':
      if (typeof value !== 'string') {
        return { valid: false, error: 'Must be text' };
      }
      if (constraints?.minLength && value.length < constraints.minLength) {
        return {
          valid: false,
          error: `Minimum ${constraints.minLength} characters required`,
        };
      }
      if (constraints?.maxLength && value.length > constraints.maxLength) {
        return {
          valid: false,
          error: `Maximum ${constraints.maxLength} characters allowed`,
        };
      }
      break;

    case 'number':
      if (isNaN(value)) {
        return { valid: false, error: 'Must be a number' };
      }
      if (constraints?.min !== undefined && Number(value) < constraints.min) {
        return {
          valid: false,
          error: `Minimum value is ${constraints.min}`,
        };
      }
      if (constraints?.max !== undefined && Number(value) > constraints.max) {
        return {
          valid: false,
          error: `Maximum value is ${constraints.max}`,
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
      } catch {
        return { valid: false, error: 'Must be a valid URL' };
      }
      break;
  }

  return { valid: true };
};

/**
 * Create a safe error boundary message
 */
export const createErrorBoundaryMessage = (error: Error): string => {
  const isDevelopment = process.env.NODE_ENV === 'development';

  if (isDevelopment) {
    return error.message;
  }

  return 'Something went wrong. Please refresh the page or contact support.';
};
