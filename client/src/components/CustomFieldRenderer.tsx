/**
 * Phase 10: CustomFieldRenderer Component
 * Dynamically renders custom fields based on their type
 * Production-ready with comprehensive field type support
 */

import { toast } from "sonner";
import React, { useCallback } from 'react';
import { PhoneInput } from '@/components/PhoneInput';
import { CustomField, CustomFieldExtended, SelectOption } from '../types/customFields';
import '../styles/customFieldsManager.css';

function formatDateInput(value: unknown): string {
  if (!value) return '';
  const date = value instanceof Date ? value : new Date(String(value));
  return Number.isNaN(date.getTime()) ? '' : date.toISOString().split('T')[0];
}

interface CustomFieldRendererProps {
  field: CustomField | CustomFieldExtended;
  value?: any;
  onChange?: (value: any) => void;
  onBlur?: () => void;
  error?: string;
  touched?: boolean;
  disabled?: boolean;
  required?: boolean;
  readOnly?: boolean;
  className?: string;
}

export function CustomFieldRenderer({
  field: fieldProp,
  value,
  onChange,
  onBlur,
  error,
  touched,
  disabled,
  required: overrideRequired,
  readOnly = false,
  className = '',
}: CustomFieldRendererProps) {
  // Cast to extended field with type-specific properties
  const field = fieldProp as CustomFieldExtended;
  const isRequired = overrideRequired !== undefined ? overrideRequired : field.required;
  const showError = touched && !!error;
  const isDisabled = disabled || readOnly;

  const handleChange = useCallback(
    (newValue: any) => {
      if (!readOnly && onChange) {
        onChange(newValue);
      }
    },
    [onChange, readOnly]
  );

  const fieldClasses = `custom-field custom-field-${field.fieldType} ${error ? 'has-error' : ''} ${disabled ? 'disabled' : ''} ${className}`;
  const labelClasses = `field-label ${isRequired ? 'required' : ''}`;

  switch (field.fieldType) {
    case 'text':
      return (
        <div className={fieldClasses}>
          <label className={labelClasses}>{field.fieldLabel}</label>
          <input
            type="text"
            value={value || ''}
            onChange={(e) => handleChange(e.target.value)}
            onBlur={onBlur}
            placeholder={field.placeholder || ''}
            disabled={isDisabled}
            className="form-input"
            maxLength={field.maxLength}
            minLength={field.minLength}
            aria-label={field.fieldLabel}
            aria-invalid={showError}
            aria-describedby={showError ? `error-${field.id}` : undefined}
          />
          {field.maxLength && (
            <span style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '0.25rem' }}>
              {(value || '').length} / {field.maxLength}
            </span>
          )}
          {field.fieldDescription && <p className="field-hint">{field.fieldDescription}</p>}
          {showError && <span className="error-message" id={`error-${field.id}`}>{error}</span>}
        </div>
      );

    case 'number':
      return (
        <div className={fieldClasses}>
          <label className={labelClasses}>{field.fieldLabel}</label>
          <input
            type="number"
            value={value || ''}
            onChange={(e) => handleChange(e.target.value === '' ? null : parseFloat(e.target.value))}
            onBlur={onBlur}
            placeholder={field.placeholder || ''}
            disabled={isDisabled}
            className="form-input"
            min={field.minValue}
            max={field.maxValue}
            step={field.decimals ? Math.pow(10, -field.decimals) : 1}
            aria-label={field.fieldLabel}
            aria-invalid={showError}
          />
          {field.fieldDescription && <p className="field-hint">{field.fieldDescription}</p>}
          {showError && <span className="error-message" id={`error-${field.id}`}>{error}</span>}
        </div>
      );

    case 'email':
      return (
        <div className={fieldClasses}>
          <label className={labelClasses}>{field.fieldLabel}</label>
          <input
            type="email"
            value={value || ''}
            onChange={(e) => handleChange(e.target.value)}
            onBlur={onBlur}
            placeholder={field.placeholder || ''}
            disabled={isDisabled}
            className="form-input"
            aria-label={field.fieldLabel}
            aria-invalid={showError}
          />
          {field.fieldDescription && <p className="field-hint">{field.fieldDescription}</p>}
          {showError && <span className="error-message" id={`error-${field.id}`}>{error}</span>}
        </div>
      );

    case 'phone':
      return (
        <div className={fieldClasses}>
          <PhoneInput
            id={`phone-${field.id}`}
            label={field.fieldLabel}
            required={isRequired}
            value={value || ''}
            onChange={handleChange}
            placeholder={field.placeholder || '700 000 000'}
            className="w-full"
          />
          {field.fieldDescription && <p className="field-hint">{field.fieldDescription}</p>}
          {showError && <span className="error-message" id={`error-${field.id}`}>{error}</span>}
        </div>
      );

    case 'date':
      return (
        <div className={fieldClasses}>
          <label className={labelClasses}>{field.fieldLabel}</label>
          <input
            type="date"
            value={formatDateInput(value)}
            onChange={(e) => handleChange(e.target.value ? new Date(e.target.value) : null)}
            onBlur={onBlur}
            disabled={isDisabled}
            className="form-input"
            min={formatDateInput(field.minDate)}
            max={formatDateInput(field.maxDate)}
            aria-label={field.fieldLabel}
            aria-invalid={showError}
          />
          {field.fieldDescription && <p className="field-hint">{field.fieldDescription}</p>}
          {showError && <span className="error-message" id={`error-${field.id}`}>{error}</span>}
        </div>
      );

    case 'select':
      return (
        <div className={fieldClasses}>
          <label className={labelClasses}>{field.fieldLabel}</label>
          <select
            value={value || ''}
            onChange={(e) => handleChange(e.target.value)}
            onBlur={onBlur}
            disabled={isDisabled}
            className="form-select"
            aria-label={field.fieldLabel}
            aria-invalid={showError}
          >
            <option value="">
              {field.placeholder || `-- Select ${field.fieldLabel} --`}
            </option>
            {(field.options || []).map((opt) => {
              const option: SelectOption = typeof (opt as any).value !== 'undefined'
                ? (opt as unknown as SelectOption)
                : { value: String(opt), label: String(opt) };
              return (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              );
            })}
          </select>
          {field.fieldDescription && <p className="field-hint">{field.fieldDescription}</p>}
          {showError && <span className="error-message" id={`error-${field.id}`}>{error}</span>}
        </div>
      );

    case 'multiSelect':
      const selectedValues = Array.isArray(value) ? value : value ? [value] : [];
      return (
        <div className={fieldClasses}>
          <label className={labelClasses}>{field.fieldLabel}</label>
          <div className="multi-select-container">
            {field.options && field.options.length > 0 ? (
              field.options.map((opt) => {
                const option: SelectOption = typeof (opt as any).value !== 'undefined'
                  ? (opt as unknown as SelectOption)
                  : { value: String(opt), label: String(opt) };
                return (
                  <label key={option.value} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={selectedValues.includes(option.value)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          handleChange([...selectedValues, option.value]);
                        } else {
                          handleChange(selectedValues.filter((v: any) => v !== option.value));
                        }
                      }}
                      disabled={isDisabled}
                    />
                    <span>{option.label}</span>
                  </label>
                );
              })
            ) : (
              <p style={{ color: '#9ca3af', margin: 0 }}>No options available</p>
            )}
          </div>
          {field.fieldDescription && <p className="field-hint">{field.fieldDescription}</p>}
          {showError && <span className="error-message" id={`error-${field.id}`}>{error}</span>}
        </div>
      );

    case 'checkbox':
      return (
        <div className={fieldClasses}>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={!!value}
              onChange={(e) => handleChange(e.target.checked)}
              onBlur={onBlur}
              disabled={isDisabled}
            />
            <span>{field.fieldLabel}</span>
          </label>
          {field.fieldDescription && <p className="field-hint">{field.fieldDescription}</p>}
          {showError && <span className="error-message" id={`error-${field.id}`}>{error}</span>}
        </div>
      );

    case 'richText':
      return (
        <div className={fieldClasses}>
          <label className={labelClasses}>{field.fieldLabel}</label>
          <textarea
            value={value || ''}
            onChange={(e) => handleChange(e.target.value)}
            onBlur={onBlur}
            placeholder={field.placeholder || ''}
            disabled={isDisabled}
            className="form-textarea"
            rows={5}
            aria-label={field.fieldLabel}
            aria-invalid={showError}
          />
          {field.fieldDescription && <p className="field-hint">{field.fieldDescription}</p>}
          {showError && <span className="error-message" id={`error-${field.id}`}>{error}</span>}
        </div>
      );

    case 'file':
      return (
        <div className={fieldClasses}>
          <label className={labelClasses}>{field.fieldLabel}</label>
          <input
            type="file"
            onChange={(e) => {
              const files = e.target.files;
              if (!files) return;

              // Check file count
              if (field.maxFiles && files.length > field.maxFiles) {
                toast.error(`You can only upload up to ${field.maxFiles} file(s)`);
                return;
              }

              // Check file types
              if (field.allowedMimeTypes && field.allowedMimeTypes.length > 0) {
                for (let i = 0; i < files.length; i++) {
                  if (!field.allowedMimeTypes.includes(files[i].type)) {
                    toast.error(`File type not allowed: ${files[i].name}`);
                    return;
                  }
                }
              }

              // Check file size
              if (field.maxFileSize) {
                for (let i = 0; i < files.length; i++) {
                  if (files[i].size > field.maxFileSize) {
                    toast.error(`File too large: ${files[i].name}. Max: ${(field.maxFileSize / 1024 / 1024).toFixed(2)}MB`);
                    return;
                  }
                }
              }

              handleChange(files);
            }}
            onBlur={onBlur}
            disabled={isDisabled}
            className="form-input-file"
            multiple={field.maxFiles !== 1}
            accept={field.allowedMimeTypes?.join(',')}
            aria-label={field.fieldLabel}
            aria-invalid={showError}
          />
          {field.allowedMimeTypes && (
            <p style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '0.25rem' }}>
              Allowed: {field.allowedMimeTypes.join(', ')}
            </p>
          )}
          {field.maxFileSize && (
            <p style={{ fontSize: '0.85rem', color: '#6b7280' }}>
              Max: {(field.maxFileSize / 1024 / 1024).toFixed(2)}MB
            </p>
          )}
          {field.fieldDescription && <p className="field-hint">{field.fieldDescription}</p>}
          {showError && <span className="error-message" id={`error-${field.id}`}>{error}</span>}
        </div>
      );

    case 'currency':
      const currencySymbols: Record<string, string> = {
        USD: '$',
        EUR: '€',
        GBP: '£',
        JPY: '¥',
        INR: '₹',
        AUD: 'A$',
        CAD: 'C$',
        KES: 'KES',
      };
      const currency = field.currency || 'USD';
      const symbol = currencySymbols[currency] || currency;

      return (
        <div className={fieldClasses}>
          <label className={labelClasses}>{field.fieldLabel}</label>
          <div className="currency-input-wrapper">
            <span className="currency-symbol">{symbol}</span>
            <input
              type="number"
              value={value || ''}
              onChange={(e) => handleChange(e.target.value === '' ? null : parseFloat(e.target.value))}
              onBlur={onBlur}
              placeholder={field.placeholder || '0.00'}
              disabled={isDisabled}
              className="form-input currency-input"
              step="0.01"
              min="0"
              aria-label={field.fieldLabel}
              aria-invalid={showError}
            />
          </div>
          {field.fieldDescription && <p className="field-hint">{field.fieldDescription}</p>}
          {showError && <span className="error-message" id={`error-${field.id}`}>{error}</span>}
        </div>
      );

    default:
      return (
        <div className={fieldClasses}>
          <p className="warning-message">Unknown field type: {field.fieldType}</p>
        </div>
      );
  }
}

/**
 * CustomFieldGroup Component
 * Renders multiple custom fields in a group
 */
interface CustomFieldGroupProps {
  fields: CustomField[];
  values: Record<string, any>;
  onChange: (fieldId: string, value: any) => void;
  onBlur?: (fieldId: string) => void;
  errors?: Record<string, string>;
  touched?: Record<string, boolean>;
  disabled?: boolean;
}

export function CustomFieldGroup({
  fields,
  values,
  onChange,
  onBlur,
  errors,
  touched,
  disabled,
}: CustomFieldGroupProps) {
  const sortedFields = [...fields].sort((a, b) => a.displayOrder - b.displayOrder);

  return (
    <div className="custom-field-group">
      {sortedFields.map((field) => (
        <CustomFieldRenderer
          key={field.id}
          field={field}
          value={values[field.id]}
          onChange={(value) => onChange(field.id, value)}
          onBlur={() => onBlur?.(field.id)}
          error={errors?.[field.id]}
          touched={touched?.[field.id]}
          disabled={disabled}
        />
      ))}
    </div>
  );
}
