/**
 * Enhanced CustomFieldDialog Component with Real-Time Validation
 * Shows validation errors as user types, not just on submit
 */

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { CustomField, EntityType, FIELD_TYPES, FIELD_TYPE_LABELS } from '../types/customFields';
import SVGIcon, { IconButton } from './iconSystem';
import {
  validateFieldName,
  validateFieldLabel,
  validateSelectOptions,
  formatValidationErrors,
  type CategorizedError,
} from './errorHandling';
import { HelpIcon, Tooltip } from './helpSystem';

interface CustomFieldDialogProps {
  mode: 'create' | 'edit';
  field: CustomField | null;
  entityType: EntityType;
  existingFields: CustomField[];
  onSave: (field: CustomField) => void;
  onCancel: () => void;
  onError?: (error: CategorizedError) => void;
}

interface FormData {
  fieldName: string;
  fieldLabel: string;
  fieldType: string;
  description: string;
  required: boolean;
  displayOrder: number;
  placeholder?: string;
  minLength?: number;
  maxLength?: number;
  minValue?: number;
  maxValue?: number;
  minDate?: string;
  maxDate?: string;
  currency?: string;
  decimalPlaces?: number;
  allowedMimeTypes?: string;
  maxFileSize?: number;
  regex?: string;
}

const defaultFormData: FormData = {
  fieldName: '',
  fieldLabel: '',
  fieldType: 'text',
  description: '',
  required: false,
  displayOrder: 0,
  maxLength: 255,
};

/**
 * Enhanced dialog component
 */
const CustomFieldDialog: React.FC<CustomFieldDialogProps> = ({
  mode,
  field,
  entityType,
  existingFields,
  onSave,
  onCancel,
  onError,
}) => {
  const [formData, setFormData] = useState<FormData>(
    field ? { ...defaultFormData, ...field } : defaultFormData
  );

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [selectOptions, setSelectOptions] = useState<string[]>(
    field && (field.fieldType === 'select' || field.fieldType === 'multiSelect')
      ? (field.options as string[]) || []
      : []
  );
  const [newOption, setNewOption] = useState('');
  const [saving, setSaving] = useState(false);

  // Get existing field names (excluding current field if editing)
  const existingFieldNames = useMemo(
    () => existingFields
      .filter((f) => f.id !== field?.id)
      .map((f) => f.fieldName),
    [existingFields, field?.id]
  );

  /**
   * Real-time validation for field name
   */
  const validateNameField = useCallback(
    (name: string) => {
      const validation = validateFieldName(name, existingFieldNames, field?.id);
      if (!validation.valid && touched.fieldName) {
        setErrors((prev) => ({ ...prev, fieldName: validation.error! }));
      } else {
        setErrors((prev) => {
          const next = { ...prev };
          delete next.fieldName;
          return next;
        });
      }
      return validation.valid;
    },
    [existingFieldNames, field?.id, touched.fieldName]
  );

  /**
   * Real-time validation for field label
   */
  const validateLabelField = useCallback(
    (label: string) => {
      const validation = validateFieldLabel(label);
      if (!validation.valid && touched.fieldLabel) {
        setErrors((prev) => ({ ...prev, fieldLabel: validation.error! }));
      } else {
        setErrors((prev) => {
          const next = { ...prev };
          delete next.fieldLabel;
          return next;
        });
      }
      return validation.valid;
    },
    [touched.fieldLabel]
  );

  /**
   * Real-time validation for select options
   */
  const validateOptionsField = useCallback(
    (options: string[], fieldType: string) => {
      if (!['select', 'multiSelect'].includes(fieldType)) {
        return true;
      }

      const validation = validateSelectOptions(options, fieldType);
      if (!validation.valid && touched.options) {
        setErrors((prev) => ({ ...prev, options: validation.error! }));
      } else {
        setErrors((prev) => {
          const next = { ...prev };
          delete next.options;
          return next;
        });
      }
      return validation.valid;
    },
    [touched.options]
  );

  /**
   * Handle field name change with real-time validation
   */
  const handleFieldNameChange = useCallback(
    (value: string) => {
      setFormData((prev) => ({ ...prev, fieldName: value }));
      if (touched.fieldName) {
        validateNameField(value);
      }
    },
    [touched.fieldName, validateNameField]
  );

  /**
   * Handle field label change with real-time validation
   */
  const handleFieldLabelChange = useCallback(
    (value: string) => {
      setFormData((prev) => ({ ...prev, fieldLabel: value }));
      if (touched.fieldLabel) {
        validateLabelField(value);
      }
    },
    [touched.fieldLabel, validateLabelField]
  );

  /**
   * Handle field blur (mark as touched)
   */
  const handleFieldBlur = useCallback((fieldName: string) => {
    setTouched((prev) => ({ ...prev, [fieldName]: true }));

    // Validate on blur
    if (fieldName === 'fieldName') {
      validateNameField(formData.fieldName);
    } else if (fieldName === 'fieldLabel') {
      validateLabelField(formData.fieldLabel);
    } else if (fieldName === 'options') {
      validateOptionsField(selectOptions, formData.fieldType);
    }
  }, [formData.fieldName, formData.fieldLabel, formData.fieldType, selectOptions, validateNameField, validateLabelField, validateOptionsField]);

  /**
   * Handle add option
   */
  const handleAddOption = useCallback(() => {
    if (newOption.trim()) {
      setSelectOptions((prev) => [...prev, newOption.trim()]);
      setNewOption('');
      // Revalidate options on change
      validateOptionsField([...selectOptions, newOption.trim()], formData.fieldType);
    }
  }, [newOption, selectOptions, formData.fieldType, validateOptionsField]);

  /**
   * Handle remove option
   */
  const handleRemoveOption = useCallback((index: number) => {
    setSelectOptions((prev) => prev.filter((_, i) => i !== index));
    const updated = selectOptions.filter((_, i) => i !== index);
    validateOptionsField(updated, formData.fieldType);
  }, [selectOptions, formData.fieldType, validateOptionsField]);

  /**
   * Validate entire form before save
   */
  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate field name
    const nameValidation = validateFieldName(formData.fieldName, existingFieldNames, field?.id);
    if (!nameValidation.valid) {
      newErrors.fieldName = nameValidation.error!;
    }

    // Validate field label
    const labelValidation = validateFieldLabel(formData.fieldLabel);
    if (!labelValidation.valid) {
      newErrors.fieldLabel = labelValidation.error!;
    }

    // Validate select options
    if (['select', 'multiSelect'].includes(formData.fieldType)) {
      const optionsValidation = validateSelectOptions(selectOptions, formData.fieldType);
      if (!optionsValidation.valid) {
        newErrors.options = optionsValidation.error!;
      }
    }

    setErrors(newErrors);
    setTouched({
      fieldName: true,
      fieldLabel: true,
      options: true,
    });

    return Object.keys(newErrors).length === 0;
  }, [formData, existingFieldNames, field?.id, selectOptions]);

  /**
   * Handle form save
   */
  const handleSave = useCallback(async () => {
    if (!validateForm()) {
      // Show error notification
      const announcement = document.createElement('div');
      announcement.setAttribute('role', 'alert');
      announcement.setAttribute('aria-live', 'assertive');
      announcement.textContent = `Form validation failed. Please fix ${Object.keys(errors).length} error(s).`;
      document.body.appendChild(announcement);
      setTimeout(() => announcement.remove(), 3000);
      return;
    }

    setSaving(true);
    try {
      // Mock API call - replace with actual service
      const savedField: CustomField = {
        id: field?.id || `field-${Date.now()}`,
        organizationId: field?.organizationId || 'org-1',
        entityType,
        fieldName: formData.fieldName,
        fieldLabel: formData.fieldLabel,
        fieldType: formData.fieldType as any,
        required: formData.required,
        displayOrder: formData.displayOrder,
        isActive: field?.isActive ?? true,
        options: ['select', 'multiSelect'].includes(formData.fieldType) ? selectOptions : undefined,
        placeholder: formData.placeholder,
        description: formData.description,
        minLength: formData.minLength,
        maxLength: formData.maxLength,
        minValue: formData.minValue,
        maxValue: formData.maxValue,
        minDate: formData.minDate,
        maxDate: formData.maxDate,
        currency: formData.currency,
        decimalPlaces: formData.decimalPlaces,
        allowedMimeTypes: formData.allowedMimeTypes?.split(',').map(s => s.trim()),
        maxFileSize: formData.maxFileSize,
        regex: formData.regex,
        createdAt: field?.createdAt || new Date(),
        updatedAt: new Date(),
      };

      onSave(savedField);
    } catch (error) {
      if (onError) {
        // onError will handle the error display
      }
    } finally {
      setSaving(false);
    }
  }, [validateForm, errors, field, entityType, formData, selectOptions, onSave, onError]);

  /**
   * Get validation status icon
   */
  const getFieldStatus = (fieldName: string) => {
    if (!touched[fieldName]) return null;

    if (errors[fieldName]) {
      return <SVGIcon name="x" size={16} color="var(--color-error)" />;
    }

    return <SVGIcon name="check" size={16} color="var(--color-success)" />;
  };

  return (
    <div className="dialog-overlay" role="presentation" onClick={onCancel}>
      <div className="dialog" role="dialog" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="dialog-header">
          <h2>{mode === 'create' ? 'Create Custom Field' : `Edit ${field?.fieldLabel}`}</h2>
          <button
            className="dialog-close"
            onClick={onCancel}
            aria-label="Close dialog"
            type="button"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="dialog-body">
          {/* Field Name */}
          <div className="form-group">
            <label htmlFor="fieldName" className="form-label">
              Field Name
              <HelpIcon content="Unique identifier (alphanumeric + underscore)" />
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input
                id="fieldName"
                type="text"
                value={formData.fieldName}
                onChange={(e) => handleFieldNameChange(e.target.value)}
                onBlur={() => handleFieldBlur('fieldName')}
                disabled={mode === 'edit'}
                className={`form-input ${errors.fieldName ? 'has-error' : ''}`}
                placeholder="field_name"
                aria-invalid={!!errors.fieldName}
                aria-describedby={errors.fieldName ? 'fieldName-error' : undefined}
              />
              {getFieldStatus('fieldName')}
            </div>
            {errors.fieldName && touched.fieldName && (
              <span className="error-message" id="fieldName-error">
                {errors.fieldName}
              </span>
            )}
            {!errors.fieldName && touched.fieldName && (
              <span className="validation-feedback valid">
                <SVGIcon name="check" size={14} /> Field name is valid
              </span>
            )}
          </div>

          {/* Field Label */}
          <div className="form-group">
            <label htmlFor="fieldLabel" className="form-label">
              Label
              <HelpIcon content="Display name shown to users" />
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input
                id="fieldLabel"
                type="text"
                value={formData.fieldLabel}
                onChange={(e) => handleFieldLabelChange(e.target.value)}
                onBlur={() => handleFieldBlur('fieldLabel')}
                className={`form-input ${errors.fieldLabel ? 'has-error' : ''}`}
                placeholder="Field Label"
                aria-invalid={!!errors.fieldLabel}
                aria-describedby={errors.fieldLabel ? 'fieldLabel-error' : undefined}
              />
              {getFieldStatus('fieldLabel')}
            </div>
            {errors.fieldLabel && touched.fieldLabel && (
              <span className="error-message" id="fieldLabel-error">
                {errors.fieldLabel}
              </span>
            )}
            {!errors.fieldLabel && touched.fieldLabel && (
              <span className="validation-feedback valid">
                <SVGIcon name="check" size={14} /> Label is valid
              </span>
            )}
          </div>

          {/* Field Type */}
          <div className="form-group">
            <label htmlFor="fieldType" className="form-label">
              Field Type
              <HelpIcon content="The data type for this field" />
            </label>
            <select
              id="fieldType"
              value={formData.fieldType}
              onChange={(e) => setFormData((prev) => ({ ...prev, fieldType: e.target.value }))}
              className="form-select"
            >
              {FIELD_TYPES.map((type) => (
                <option key={type} value={type}>
                  {FIELD_TYPE_LABELS[type]}
                </option>
              ))}
            </select>
          </div>

          {/* Field Description */}
          <div className="form-group">
            <label htmlFor="description" className="form-label">
              Description (Optional)
              <HelpIcon content="Help text shown to users" />
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              className="form-textarea"
              placeholder="Enter field description..."
              rows={3}
            />
          </div>

          {/* Select Options (for select/multiSelect fields) */}
          {['select', 'multiSelect'].includes(formData.fieldType) && (
            <div className="form-group">
              <label className="form-label">
                Options
                <HelpIcon content="Predefined values for this field" />
              </label>

              {/* Options List */}
              {selectOptions.length > 0 && (
                <div className="options-list">
                  {selectOptions.map((option, index) => (
                    <div key={index} className="option-item">
                      <span>{option}</span>
                      <IconButton
                        icon="delete"
                        variant="danger"
                        size="small"
                        onClick={() => handleRemoveOption(index)}
                        aria-label={`Remove option "${option}"`}
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Add Option Input */}
              <div className="option-input-group">
                <input
                  type="text"
                  value={newOption}
                  onChange={(e) => setNewOption(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddOption();
                    }
                  }}
                  className="form-input"
                  placeholder="Type option and press Enter or click Add"
                  aria-label="New option"
                />
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleAddOption}
                  disabled={!newOption.trim()}
                >
                  <SVGIcon name="plus" size={16} />
                  Add
                </button>
              </div>

              {errors.options && touched.options && (
                <span className="error-message">{errors.options}</span>
              )}
            </div>
          )}

          {/* Required Checkbox */}
          <div className="form-group">
            <label htmlFor="required" className="form-label">
              <input
                id="required"
                type="checkbox"
                checked={formData.required}
                onChange={(e) => setFormData((prev) => ({ ...prev, required: e.target.checked }))}
              />
              <span style={{ marginLeft: '8px' }}>Required field</span>
              <HelpIcon content="Users must provide a value for this field" />
            </label>
          </div>

          {/* Display Order */}
          <div className="form-group">
            <label htmlFor="displayOrder" className="form-label">
              Display Order
              <HelpIcon content="Order in which field appears in forms" />
            </label>
            <input
              id="displayOrder"
              type="number"
              value={formData.displayOrder}
              onChange={(e) => setFormData((prev) => ({ ...prev, displayOrder: parseInt(e.target.value, 10) }))}
              className="form-input"
              min="0"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="dialog-footer">
          <div className="button-group button-group-horizontal button-group-right">
            <button
              className="btn btn-secondary"
              onClick={onCancel}
              disabled={saving}
              type="button"
            >
              Cancel
            </button>
            <button
              className="btn btn-primary"
              onClick={handleSave}
              disabled={saving}
              aria-busy={saving}
              type="button"
            >
              {saving && <SVGIcon name="loading" size={16} />}
              {saving ? 'Saving...' : mode === 'create' ? 'Create Field' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomFieldDialog;
