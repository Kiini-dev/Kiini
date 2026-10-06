import { toast } from "sonner";
/**
 * Phase 10: CustomFieldsManager Component
 * Admin interface for managing custom fields per entity type
 */

import React, { useState, useEffect } from 'react';
import { ModuleLayout } from '@/components/ModuleLayout';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import { useCustomFields } from '../../hooks/useCustomFields';
import { CustomField, ENTITY_TYPES, FIELD_TYPES, FIELD_TYPE_LABELS, CreateCustomFieldInput } from '../../types/customFields';
import '../../styles/customFieldsManager.css';

export function CustomFieldsManagerInner() {
  const [selectedEntity, setSelectedEntity] = useState<string>(ENTITY_TYPES[0]);
  const [showDialog, setShowDialog] = useState(false);
  const [editingField, setEditingField] = useState<CustomField | null>(null);
  const [formData, setFormData] = useState<any>({
    fieldLabel: '',
    fieldName: '',
    fieldType: 'text',
    fieldDescription: '',
    required: false,
    displayOrder: 0,
    options: '[]',
  });

  const { fields, loading, error, getFieldsByEntity, createField, updateField, deleteField } = useCustomFields();

  // Load fields when entity changes
  useEffect(() => {
    loadFields();
  }, [selectedEntity]);

  const loadFields = async () => {
    await getFieldsByEntity(selectedEntity);
  };

  const handleOpenDialog = (field?: CustomField) => {
    if (field) {
      setEditingField(field);
      setFormData({
        fieldLabel: field.fieldLabel,
        fieldName: field.fieldName,
        fieldType: field.fieldType,
        fieldDescription: field.fieldDescription || '',
        required: field.required,
        displayOrder: field.displayOrder,
        options: field.options ? JSON.stringify(field.options) : '[]',
      });
    } else {
      setEditingField(null);
      setFormData({
        fieldLabel: '',
        fieldName: '',
        fieldType: 'text',
        fieldDescription: '',
        required: false,
        displayOrder: 0,
        options: '[]',
      });
    }
    setShowDialog(true);
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
    setEditingField(null);
  };

  const handleSave = async () => {
    try {
      // Validate required fields
      if (!formData.fieldLabel || !formData.fieldName || !formData.fieldType) {
        toast.error('Please fill in all required fields');
        return;
      }

      // Parse options if select/multiSelect
      let options: string[] | undefined = undefined;
      if (['select', 'multiSelect'].includes(formData.fieldType)) {
        try {
          options = JSON.parse(formData.options);
          if (!Array.isArray(options) || options.length === 0) {
            toast.error('Please provide at least one option for select fields');
            return;
          }
        } catch (e) {
          toast.error('Invalid JSON format for options');
          return;
        }
      }

      if (editingField) {
        // Update existing field
        await updateField(editingField.id, {
          fieldLabel: formData.fieldLabel,
          fieldDescription: formData.fieldDescription,
          required: formData.required,
          displayOrder: parseInt(formData.displayOrder),
          options,
        });
      } else {
        // Create new field
        const input: CreateCustomFieldInput = {
          organizationId: 'org-placeholder', // Should come from auth context
          entityType: selectedEntity,
          fieldName: formData.fieldName,
          fieldLabel: formData.fieldLabel,
          fieldType: formData.fieldType,
          fieldDescription: formData.fieldDescription || undefined,
          required: formData.required,
          displayOrder: parseInt(formData.displayOrder),
          options,
        };
        await createField(input);
      }

      handleCloseDialog();
      await loadFields();
    } catch (err) {
      console.error('Error saving field:', err);
      toast.error(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleDelete = async (fieldId: string) => {
    if (!window.confirm('Are you sure you want to delete this field? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteField(fieldId);
      await loadFields();
    } catch (err) {
      console.error('Error deleting field:', err);
      toast.error(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const sortedFields = [...fields].sort((a, b) => a.displayOrder - b.displayOrder);

  return (
    <div className="custom-fields-manager">
      <div className="manager-header">
        <h1>Custom Fields Manager</h1>
        <p className="subtitle">Create and manage custom fields for all entity types</p>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {/* Entity Type Tabs */}
      <div className="entity-tabs">
        <div className="tabs">
          {ENTITY_TYPES.map((entity) => (
            <button
              key={entity}
              className={`tab ${selectedEntity === entity ? 'active' : ''}`}
              onClick={() => setSelectedEntity(entity)}
            >
              {entity}
            </button>
          ))}
        </div>

        <button className="btn btn-primary" onClick={() => handleOpenDialog()}>
          + Add Custom Field
        </button>
      </div>

      {/* Fields List */}
      <div className="fields-container">
        {loading && <p className="loading-message">Loading fields...</p>}

        {!loading && fields.length === 0 && (
          <div className="empty-state">
            <p>No custom fields yet for {selectedEntity}</p>
            <p className="hint">Click "Add Custom Field" to create one</p>
          </div>
        )}

        {!loading && fields.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Label</TableHead>
                <TableHead>Field Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Required</TableHead>
                <TableHead>Order</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedFields.map((field) => (
                <TableRow key={field.id} className={field.isActive ? '' : 'inactive'}>
                  <TableCell>{field.fieldLabel}</TableCell>
                  <TableCell className="font-mono">{field.fieldName}</TableCell>
                  <TableCell>{FIELD_TYPE_LABELS[field.fieldType]}</TableCell>
                  <TableCell>{field.required ? '✓' : '—'}</TableCell>
                  <TableCell>{field.displayOrder}</TableCell>
                  <TableCell className="actions">
                    <button
                      className="btn-icon"
                      onClick={() => handleOpenDialog(field)}
                      title="Edit field"
                    >
                      ✎
                    </button>
                    <button
                      className="btn-icon btn-danger"
                      onClick={() => handleDelete(field.id)}
                      title="Delete field"
                    >
                      ✕
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Dialog */}
      {showDialog && (
        <div className="dialog-overlay" onClick={handleCloseDialog}>
          <div className="dialog" onClick={(e) => e.stopPropagation()}>
            <div className="dialog-header">
              <h2>{editingField ? 'Edit' : 'Add'} Custom Field</h2>
              <button className="close-btn" onClick={handleCloseDialog}>✕</button>
            </div>

            <div className="dialog-body">
              <div className="form-group">
                <label htmlFor="field-label">Field Label *</label>
                <input
                  id="field-label"
                  type="text"
                  value={formData.fieldLabel}
                  onChange={(e) => setFormData({ ...formData, fieldLabel: e.target.value })}
                  className="form-input"
                  placeholder="e.g., Customer Preference"
                />
              </div>

              <div className="form-group">
                <label htmlFor="field-name">Field Name *</label>
                <input
                  id="field-name"
                  type="text"
                  value={formData.fieldName}
                  onChange={(e) => setFormData({ ...formData, fieldName: e.target.value })}
                  className="form-input"
                  placeholder="e.g., customer_preference"
                  disabled={!!editingField}
                  pattern="^[a-z_]+$"
                  title="Use lowercase letters and underscores only"
                />
                <p className="field-hint">Lowercase letters and underscores only</p>
              </div>

              <div className="form-group">
                <label htmlFor="field-type">Type *</label>
                <select
                  id="field-type"
                  value={formData.fieldType}
                  onChange={(e) => setFormData({ ...formData, fieldType: e.target.value })}
                  className="form-select"
                >
                  {FIELD_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {FIELD_TYPE_LABELS[type]}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="field-description">Description</label>
                <textarea
                  id="field-description"
                  value={formData.fieldDescription}
                  onChange={(e) => setFormData({ ...formData, fieldDescription: e.target.value })}
                  className="form-textarea"
                  placeholder="Help text shown to users"
                  rows={3}
                />
              </div>

              <div className="form-group">
                <label htmlFor="display-order">Display Order</label>
                <input
                  id="display-order"
                  type="number"
                  value={formData.displayOrder}
                  onChange={(e) => setFormData({ ...formData, displayOrder: e.target.value })}
                  className="form-input"
                  min="0"
                />
                <p className="field-hint">Lower numbers appear first</p>
              </div>

              <div className="form-group">
                <label htmlFor="required">
                  <input
                    id="required"
                    type="checkbox"
                    checked={formData.required}
                    onChange={(e) => setFormData({ ...formData, required: e.target.checked })}
                  />
                  <span>Required field</span>
                </label>
              </div>

              {['select', 'multiSelect'].includes(formData.fieldType) && (
                <div className="form-group">
                  <label htmlFor="options">Options (JSON array) *</label>
                  <textarea
                    id="options"
                    value={formData.options}
                    onChange={(e) => setFormData({ ...formData, options: e.target.value })}
                    className="form-textarea font-mono"
                    placeholder='["Option 1", "Option 2", "Option 3"]'
                    rows={5}
                  />
                  <p className="field-hint">Format: ["Option 1", "Option 2", ...]</p>
                </div>
              )}
            </div>

            <div className="dialog-footer">
              <button className="btn btn-secondary" onClick={handleCloseDialog}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleSave}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function CustomFieldsManager() {
  return (
    <ModuleLayout
      title="Custom Fields Manager"
      description="Create and manage custom fields for all entity types"
      breadcrumbs={[
        { label: "Tools", href: "/tools" },
        { label: "Custom Fields" },
      ]}
    >
      <CustomFieldsManagerInner />
    </ModuleLayout>
  );
}

export default CustomFieldsManager;
