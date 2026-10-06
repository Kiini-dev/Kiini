/**
 * Phase 10: Custom Field Dialog Component
 * Dialog for creating and editing custom fields
 */

import React, { useState, useEffect } from 'react';
import {
  CustomField,
  CreateCustomFieldInput,
  UpdateCustomFieldInput,
  EntityType,
  FIELD_TYPES,
  FIELD_TYPE_LABELS,
  SelectOption,
} from '@/types/customFields';
import customFieldsService from '@/services/customFieldsService';
import { categorizeError, createErrorNotification, ErrorNotification, validateFieldName, validateFieldLabel, validateSelectOptions } from './errorHandling';
import { IconButton } from './iconSystem';
import '../styles/customFieldsManager.css';
import './designTokens.css';
import './enhancedStyles.css';

interface CustomFieldDialogProps {
  mode?: 'create' | 'edit';
  field?: CustomField | null;
  entityType?: EntityType;
  onSave?: (field: CustomField | any) => void;
  onCancel?: () => void;
  isOpen?: boolean;
  onClose?: () => void;
}

const CustomFieldDialog: React.FC<CustomFieldDialogProps> = ({
  mode,
  field,
  entityType,
  onSave,
  onCancel,
  isOpen,
  onClose,
}) => {
  const effectiveMode = mode ?? (field ? 'edit' : 'create');
  const isDialogOpen = isOpen ?? true;
  const handleClose = onCancel ?? onClose ?? (() => undefined);
  const handleSaveValue = (savedField: CustomField | any) => {
    if (typeof onSave === 'function') {
      const normalized = savedField && typeof savedField === 'object'
        ? {
            name: savedField.fieldName ?? savedField.name ?? '',
            label: savedField.fieldLabel ?? savedField.label ?? '',
            type: savedField.fieldType ?? savedField.type ?? 'text',
            required: Boolean(savedField.required),
            ...(savedField.id || savedField.fieldId ? { id: savedField.id ?? savedField.fieldId } : {}),
            ...(savedField.entityType ? { entityType: savedField.entityType } : {}),
          }
        : savedField;

      onSave(normalized);
    }
  };
  const isLegacyDialog = typeof onClose === 'function' && typeof onCancel === 'undefined';
  // Form state
  const [formData, setFormData] = useState<CreateCustomFieldInput>({
    organizationId: '',
    entityType: entityType || 'Contact',
    fieldName: '',
    fieldLabel: '',
    fieldType: 'text',
    fieldDescription: '',
    required: false,
    displayOrder: 0,
    options: [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [validationFeedback, setValidationFeedback] = useState<Record<string, boolean | null>>({});
  const [notifications, setNotifications] = useState<ErrorNotification[]>([]);
  const [saving, setSaving] = useState(false);
  const [selectOptions, setSelectOptions] = useState<SelectOption[]>([]);
  const [newOption, setNewOption] = useState('');

  const getValidationResult = (
    validator: ((value: string) => any) | undefined,
    value: string,
  ): { valid: boolean; error?: string } => {
    const result = validator ? validator(value) : null;

    if (result && typeof result === 'object' && 'valid' in result) {
      return {
        valid: Boolean((result as any).valid),
        error: (result as any).error || undefined,
      };
    }

    return {
      valid: result == null || result === false || result === '' || result === undefined,
      error: typeof result === 'string' && result.length > 0 ? result : undefined,
    };
  };

  /**
   * Initialize form with field data (for edit mode)
   */
  useEffect(() => {
    const normalizedField = field as any;
    const sourceField = normalizedField && (normalizedField.fieldName || normalizedField.name || normalizedField.fieldLabel || normalizedField.label)
      ? normalizedField
      : null;

    if (effectiveMode === 'edit' && sourceField) {
      setFormData({
        organizationId: sourceField.organizationId ?? '',
        entityType: (sourceField.entityType as EntityType) ?? entityType ?? 'Contact',
        fieldName: sourceField.fieldName ?? sourceField.name ?? '',
        fieldLabel: sourceField.fieldLabel ?? sourceField.label ?? '',
        fieldType: sourceField.fieldType ?? sourceField.type ?? 'text',
        fieldDescription: sourceField.fieldDescription ?? '',
        required: Boolean(sourceField.required),
        displayOrder: sourceField.displayOrder ?? 0,
        options: sourceField.options ?? [],
      });
      const parsedOptions = sourceField.options ?? [];
      if (parsedOptions.length > 0) {
        setSelectOptions(
          parsedOptions.map((opt: string, idx: number) => ({
            value: opt,
            label: opt,
            order: idx,
          }))
        );
      } else {
        setSelectOptions([]);
      }
    }
  }, [effectiveMode, field, entityType]);

  /**
   * Handle form input changes
   */
  const handleFieldNameChange = (value: string) => {
    setFormData(prev => ({ ...prev, fieldName: value }));
    if (touched.fieldName) {
      const result = getValidationResult(validateFieldName, value);
      if (!result.valid) {
        setErrors(prev => ({ ...prev, fieldName: result.error || 'Field name is invalid' }));
        setValidationFeedback(prev => ({ ...prev, fieldName: false }));
      } else {
        setErrors(prev => { const e = { ...prev }; delete e.fieldName; return e; });
        setValidationFeedback(prev => ({ ...prev, fieldName: true }));
      }
    }
  };

  const handleFieldNameBlur = () => {
    setTouched(prev => ({ ...prev, fieldName: true }));
    const result = getValidationResult(validateFieldName, formData.fieldName);
    if (!result.valid) {
      setErrors(prev => ({ ...prev, fieldName: result.error || 'Field name is invalid' }));
      setValidationFeedback(prev => ({ ...prev, fieldName: false }));
    } else {
      setErrors(prev => { const e = { ...prev }; delete e.fieldName; return e; });
      setValidationFeedback(prev => ({ ...prev, fieldName: true }));
    }
  };

  const handleFieldLabelChange = (value: string) => {
    setFormData(prev => ({ ...prev, fieldLabel: value }));
    if (touched.fieldLabel) {
      const result = getValidationResult(validateFieldLabel, value);
      if (!result.valid) {
        setErrors(prev => ({ ...prev, fieldLabel: result.error || 'Field label is invalid' }));
        setValidationFeedback(prev => ({ ...prev, fieldLabel: false }));
      } else {
        setErrors(prev => { const e = { ...prev }; delete e.fieldLabel; return e; });
        setValidationFeedback(prev => ({ ...prev, fieldLabel: true }));
      }
    }
  };

  const handleFieldLabelBlur = () => {
    setTouched(prev => ({ ...prev, fieldLabel: true }));
    const result = getValidationResult(validateFieldLabel, formData.fieldLabel);
    if (!result.valid) {
      setErrors(prev => ({ ...prev, fieldLabel: result.error || 'Field label is invalid' }));
      setValidationFeedback(prev => ({ ...prev, fieldLabel: false }));
    } else {
      setErrors(prev => { const e = { ...prev }; delete e.fieldLabel; return e; });
      setValidationFeedback(prev => ({ ...prev, fieldLabel: true }));
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target as any;
    
    if (name === 'fieldName') {
      handleFieldNameChange(value);
      return;
    }
    if (name === 'fieldLabel') {
      handleFieldLabelChange(value);
      return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  /**
   * Validate form before submission
   */
  const validateFormOnSubmit = (): boolean => {
    const newTouched = { fieldName: true, fieldLabel: true, fieldType: true, entityType: true, options: true };
    setTouched(newTouched);
    
    const newErrors: Record<string, string> = {};
    const nameResult = getValidationResult(validateFieldName, formData.fieldName);
    if (!nameResult.valid) newErrors.fieldName = nameResult.error || '';

    const labelResult = getValidationResult(validateFieldLabel, formData.fieldLabel);
    if (!labelResult.valid) newErrors.fieldLabel = labelResult.error || '';

    if (!formData.fieldType) {
      newErrors.fieldType = 'Field type is required';
    }

    if (!formData.entityType) {
      newErrors.entityType = 'Entity type is required';
    }

    if ((formData.fieldType === 'select' || formData.fieldType === 'multiSelect') && selectOptions.length === 0) {
      newErrors.options = 'At least one option is required for select fields';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle add option
   */
  const handleAddOption = () => {
    if (!newOption.trim()) return;

    const newSelectOption: SelectOption = {
      value: newOption.toLowerCase().replace(/\s+/g, '_'),
      label: newOption,
      order: selectOptions.length,
    };

    setSelectOptions([...selectOptions, newSelectOption]);
    setNewOption('');
  };

  /**
   * Handle remove option
   */
  const handleRemoveOption = (index: number) => {
    setSelectOptions(selectOptions.filter((_, i) => i !== index));
  };

  /**
   * Handle save
   */
  const handleSave = async () => {
    if (!validateFormOnSubmit()) return;

    setSaving(true);

    try {
      const payload = {
        ...formData,
        options: selectOptions.map(opt => opt.label),
      };

      let savedField: CustomField | undefined;

      if (effectiveMode === 'create') {
        savedField = await customFieldsService.createField(payload);
      } else if (effectiveMode === 'edit' && field) {
        const updatePayload: UpdateCustomFieldInput = {
          fieldLabel: payload.fieldLabel,
          fieldDescription: payload.fieldDescription,
          required: payload.required,
          displayOrder: payload.displayOrder,
          options: payload.options,
        };
        savedField = await customFieldsService.updateField((field as any).id, updatePayload);
      } else {
        throw new Error('Invalid operation');
      }

      const resolvedField = savedField ?? ({
        id: (field as any)?.id ?? 'new-field',
        fieldName: payload.fieldName,
        fieldLabel: payload.fieldLabel,
        fieldType: payload.fieldType,
        required: Boolean(payload.required),
        entityType: payload.entityType,
        organizationId: payload.organizationId,
        displayOrder: payload.displayOrder ?? 0,
        isActive: true,
        options: payload.options ?? [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as CustomField);

      if (isLegacyDialog) {
        handleSaveValue({
          name: resolvedField.fieldName ?? formData.fieldName,
          label: resolvedField.fieldLabel ?? formData.fieldLabel,
          type: resolvedField.fieldType ?? formData.fieldType,
          required: resolvedField.required ?? formData.required,
          ...(resolvedField.id ? { id: resolvedField.id } : {}),
        });
      } else {
        handleSaveValue(resolvedField);
      }
      if (typeof onClose === 'function') {
        onClose();
      }
      if (typeof onCancel === 'function') {
        onCancel();
      }
    } catch (err) {
      const categorized = categorizeError(err);
      const notification = createErrorNotification(categorized, mode === 'create' ? 'create' : 'update');
      setNotifications(prev => [...prev, notification]);
      setErrors({ submit: categorized.userMessage });
      console.error('Error saving field:', err);
    } finally {
      setSaving(false);
    }
  };

  /**
   * Render option configuration
   */
  const renderOptionsConfig = () => {
    if (formData.fieldType !== 'select' && formData.fieldType !== 'multiSelect') {
      return null;
    }

    return (
      <div className="form-group">
        <label>Options</label>
        {errors.options && <span className="error-message">{errors.options}</span>}
        <div style={{ marginBottom: '0.75rem' }}>
          {selectOptions.map((option, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                gap: '0.5rem',
                marginBottom: '0.5rem',
                alignItems: 'center',
              }}
            >
              <span style={{ flex: 1, padding: '0.5rem', background: '#f3f4f6', borderRadius: '0.375rem' }}>
                {option.label}
              </span>
              <button
                type="button"
                className="btn-icon btn-danger"
                onClick={() => handleRemoveOption(idx)}
                style={{ width: '2rem', height: '2rem' }}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            className="form-input"
            placeholder="Add new option"
            value={newOption}
            onChange={e => setNewOption(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddOption();
              }
            }}
            style={{ flex: 1 }}
          />
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleAddOption}
          >
            Add
          </button>
        </div>
      </div>
    );
  };

  if (!isDialogOpen) {
    return null;
  }

  return (
    <div className="dialog-overlay">
      <div className="dialog" role="dialog" aria-labelledby="custom-field-dialog-title">
        {/* Header */}
        <div className="dialog-header">
          <h2 id="custom-field-dialog-title">{effectiveMode === 'create' ? 'Create' : 'Edit'} Custom Field</h2>
          <button
            className="close-btn"
            onClick={handleClose}
            disabled={saving}
            aria-label="Close dialog"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="dialog-body">
          {/* Submit Error */}
          {errors.submit && (
            <div className="error-banner" style={{ marginBottom: '1rem' }}>
              {errors.submit}
            </div>
          )}

          {/* Field Name */}
          <div className="form-group">
            <label htmlFor="fieldName">Field Name *</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input
                id="fieldName"
                type="text"
                name="fieldName"
                value={formData.fieldName}
                onChange={handleInputChange}
                onBlur={handleFieldNameBlur}
                placeholder="e.g., customer_type"
                disabled={effectiveMode === 'edit'}
                aria-invalid={errors.fieldName ? 'true' : 'false'}
                aria-describedby={errors.fieldName ? 'fieldName-error' : undefined}
              />
              {touched.fieldName && validationFeedback.fieldName !== null && (
                <div style={{ marginLeft: '0.5rem' }}>
                  {validationFeedback.fieldName ? (
                    <IconButton
                      icon="checkmark"
                      variant="ghost"
                      tooltip="Valid field name"
                      role="status"
                      aria-label="Field name is valid"
                      iconSize={16}
                      style={{ opacity: 0.7 }}
                    />
                  ) : (
                    <IconButton
                      icon="x"
                      variant="ghost"
                      tooltip="Invalid field name"
                      role="alert"
                      aria-label="Field name is invalid"
                      iconSize={16}
                      style={{ opacity: 0.7 }}
                    />
                  )}
                </div>
              )}
            </div>
            {errors.fieldName && <span className="error-message" id="fieldName-error">{errors.fieldName}</span>}
            <p style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '0.25rem' }}>
              Machine-readable name (alphanumeric and underscore only)
            </p>
          </div>

          {/* Field Label */}
          <div className="form-group">
            <label htmlFor="fieldLabel">Field Label *</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input
                id="fieldLabel"
                type="text"
                name="fieldLabel"
                value={formData.fieldLabel}
                onChange={handleInputChange}
                onBlur={handleFieldLabelBlur}
                placeholder="e.g., Customer Type"
                aria-invalid={errors.fieldLabel ? 'true' : 'false'}
                aria-describedby={errors.fieldLabel ? 'fieldLabel-error' : undefined}
              />
              {touched.fieldLabel && validationFeedback.fieldLabel !== null && (
                <div style={{ marginLeft: '0.5rem' }}>
                  {validationFeedback.fieldLabel ? (
                    <IconButton
                      icon="checkmark"
                      variant="ghost"
                      tooltip="Valid field label"
                      role="status"
                      aria-label="Field label is valid"
                      iconSize={16}
                      style={{ opacity: 0.7 }}
                    />
                  ) : (
                    <IconButton
                      icon="x"
                      variant="ghost"
                      tooltip="Invalid field label"
                      role="alert"
                      aria-label="Field label is invalid"
                      iconSize={16}
                      style={{ opacity: 0.7 }}
                    />
                  )}
                </div>
              )}
            </div>
            {errors.fieldLabel && <span className="error-message" id="fieldLabel-error">{errors.fieldLabel}</span>}
          </div>

          {/* Field Description */}
          <div className="form-group">
            <label htmlFor="fieldDescription">Description</label>
            <textarea
              id="fieldDescription"
              name="fieldDescription"
              value={formData.fieldDescription}
              onChange={handleInputChange}
              placeholder="e.g., Indicates the type of customer..."
              style={{ minHeight: '80px' }}
            />
          </div>

          {/* Field Type */}
          <div className="form-group">
            <label htmlFor="fieldType">Field Type *</label>
            <select
              id="fieldType"
              name="fieldType"
              value={formData.fieldType}
              onChange={handleInputChange}
              disabled={effectiveMode === 'edit'}
            >
              {FIELD_TYPES.map(type => (
                <option key={type} value={type}>
                  {FIELD_TYPE_LABELS[type]}
                </option>
              ))}
            </select>
            {errors.fieldType && <span className="error-message">{errors.fieldType}</span>}
          </div>

          {/* Options for select fields */}
          {renderOptionsConfig()}

          {/* Required */}
          <div className="form-group with-checkbox">
            <input
              id="required"
              type="checkbox"
              name="required"
              checked={formData.required}
              onChange={handleInputChange}
            />
            <label htmlFor="required" style={{ marginBottom: 0 }}>
              Required field
            </label>
          </div>

          {/* Display Order */}
          <div className="form-group">
            <label htmlFor="displayOrder">Display Order</label>
            <input
              id="displayOrder"
              type="number"
              name="displayOrder"
              value={formData.displayOrder}
              onChange={handleInputChange}
              placeholder="0"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="dialog-footer">
          <button
            className="btn btn-secondary"
            onClick={handleClose}
            disabled={saving}
          >
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomFieldDialog;
export { CustomFieldDialog };
