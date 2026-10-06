/**
 * Enhanced CustomFieldsManager Component with Multi-Select, Batch Operations,
 * Real-time Validation, and Improved UX
 */

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { CustomField, EntityType, FIELD_TYPES, FIELD_TYPE_LABELS, ENTITY_TYPES } from '../types/customFields';
import CustomFieldDialog from './CustomFieldDialog';
import CustomFieldRenderer from './CustomFieldRenderer';
import { HelpPanel, HelpIcon } from './helpSystem';
import SVGIcon, { IconButton } from './iconSystem';
import { categorizeError, createErrorNotification, type ErrorNotification } from './errorHandling';
import '../customFields/enhancedStyles.css';
import '../customFields/designTokens.css';

interface CustomFieldsManagerProps {
  onFieldsChange?: (fields: CustomField[]) => void;
}

/**
 * Main manager component with enhanced features
 */
const CustomFieldsManager: React.FC<CustomFieldsManagerProps> = ({ onFieldsChange }) => {
  // State management
  const [selectedEntityType, setSelectedEntityType] = useState<EntityType>('Contact');
  const [fields, setFields] = useState<CustomField[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterByType, setFilterByType] = useState<string>('');
  const [sortBy, setSortBy] = useState<'name' | 'type' | 'created'>('name');
  const [selectedFields, setSelectedFields] = useState<Set<string>>(new Set());
  const [selectedField, setSelectedField] = useState<CustomField | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [errorNotifications, setErrorNotifications] = useState<ErrorNotification[]>([]);
  const [helpOpen, setHelpOpen] = useState(false);

  // Real-time validation state
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  /**
   * Load fields for selected entity type
   */
  useEffect(() => {
    loadFields();
  }, [selectedEntityType]);

  const loadFields = useCallback(async () => {
    setLoading(true);
    try {
      // Mock API call - replace with actual API service
      const mockFields: CustomField[] = [
        {
          id: '1',
          organizationId: 'org-1',
          entityType: selectedEntityType,
          fieldName: 'custom_test',
          fieldLabel: 'Test Field',
          fieldType: 'text',
          required: false,
          displayOrder: 1,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      setFields(mockFields);
      onFieldsChange?.(mockFields);
    } catch (error) {
      const categorized = categorizeError(error);
      addErrorNotification(createErrorNotification(categorized, 'fetch'));
    } finally {
      setLoading(false);
    }
  }, [selectedEntityType, onFieldsChange]);

  /**
   * Filter, search, and sort fields
   */
  const filteredAndSortedFields = useMemo(() => {
    let result = [...fields];

    // Search by name or label
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (field) =>
          field.fieldName.toLowerCase().includes(query) ||
          field.fieldLabel.toLowerCase().includes(query)
      );
    }

    // Filter by type
    if (filterByType) {
      result = result.filter((field) => field.fieldType === filterByType);
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'type':
          return a.fieldType.localeCompare(b.fieldType);
        case 'created':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'name':
        default:
          return a.fieldLabel.localeCompare(b.fieldLabel);
      }
    });

    return result;
  }, [fields, searchQuery, filterByType, sortBy]);

  /**
   * Handle entity type tab change
   */
  const handleEntityTypeChange = useCallback((type: EntityType) => {
    setSelectedEntityType(type);
    setSelectedFields(new Set());
    setSearchQuery('');
  }, []);

  /**
   * Handle checkbox selection
   */
  const handleSelectField = useCallback((fieldId: string) => {
    setSelectedFields((prev) => {
      const next = new Set(prev);
      if (next.has(fieldId)) {
        next.delete(fieldId);
      } else {
        next.add(fieldId);
      }
      return next;
    });
  }, []);

  /**
   * Select all fields
   */
  const handleSelectAll = useCallback(() => {
    if (selectedFields.size === filteredAndSortedFields.length) {
      setSelectedFields(new Set());
    } else {
      setSelectedFields(new Set(filteredAndSortedFields.map((f) => f.id)));
    }
  }, [selectedFields.size, filteredAndSortedFields]);

  /**
   * Create new field
   */
  const handleCreateField = useCallback(() => {
    setSelectedField(null);
    setDialogMode('create');
    setShowDialog(true);
  }, []);

  /**
   * Edit field
   */
  const handleEditField = useCallback((field: CustomField) => {
    setSelectedField(field);
    setDialogMode('edit');
    setShowDialog(true);
  }, []);

  /**
   * Delete single field
   */
  const handleDeleteField = useCallback((fieldId: string) => {
    if (window.confirm('Are you sure you want to delete this field? This cannot be undone.')) {
      // Mock delete - replace with actual API call
      setFields((prev) => prev.filter((f) => f.id !== fieldId));
      setSelectedFields((prev) => {
        const next = new Set(prev);
        next.delete(fieldId);
        return next;
      });
    }
  }, []);

  /**
   * Delete selected fields
   */
  const handleBatchDelete = useCallback(() => {
    const count = selectedFields.size;
    if (
      window.confirm(
        `Delete ${count} field${count !== 1 ? 's' : ''}? This cannot be undone.`
      )
    ) {
      setFields((prev) => prev.filter((f) => !selectedFields.has(f.id)));
      setSelectedFields(new Set());
    }
  }, [selectedFields]);

  /**
   * Disable selected fields
   */
  const handleBatchDisable = useCallback(() => {
    setFields((prev) =>
      prev.map((f) =>
        selectedFields.has(f.id) ? { ...f, isActive: false } : f
      )
    );
  }, [selectedFields]);

  /**
   * Enable selected fields
   */
  const handleBatchEnable = useCallback(() => {
    setFields((prev) =>
      prev.map((f) =>
        selectedFields.has(f.id) ? { ...f, isActive: true } : f
      )
    );
  }, [selectedFields]);

  /**
   * Handle field saved from dialog
   */
  const handleFieldSaved = useCallback(
    (field: CustomField) => {
      if (dialogMode === 'create') {
        setFields((prev) => [...prev, field]);
      } else {
        setFields((prev) =>
          prev.map((f) => (f.id === field.id ? field : f))
        );
      }
      setShowDialog(false);
      onFieldsChange?..(fields);
    },
    [dialogMode, fields, onFieldsChange]
  );

  /**
   * Add error notification
   */
  const addErrorNotification = useCallback((notification: ErrorNotification) => {
    setErrorNotifications((prev) => [...prev, notification]);
    setTimeout(() => {
      setErrorNotifications((prev) => prev.filter((n) => n.id !== notification.id));
    }, 5000);
  }, []);

  /**
   * Dismiss error notification
   */
  const dismissErrorNotification = useCallback((id: string) => {
    setErrorNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  return (
    <div className="custom-fields-container" role="main">
      {/* Skip link for accessibility */}
      <a href="#fields-table" className="skip-link">
        Skip to main content
      </a>

      {/* Error Notifications */}
      {errorNotifications.map((notification) => (
        <div
          key={notification.id}
          className={`notification notification-${notification.type}`}
          role="alert"
          aria-live="assertive"
        >
          <div className="notification-content">
            <strong>{notification.title}</strong>
            <p>{notification.message}</p>
          </div>
          <button
            className="notification-close"
            onClick={() => dismissErrorNotification(notification.id)}
            aria-label="Dismiss notification"
          >
            ✕
          </button>
        </div>
      ))}

      <div className="custom-fields-manager">
        {/* Header */}
        <div className="manager-header">
          <div>
            <h1>Custom Fields Manager</h1>
            <p className="subtitle">Manage custom fields for your CRM entities</p>
          </div>
          <div className="header-actions">
            <button
              className="btn btn-primary"
              onClick={handleCreateField}
            >
              <SVGIcon name="plus" size={16} />
              Add Custom Field
            </button>
            <IconButton
              icon="help"
              variant="ghost"
              tooltip="Help"
              onClick={() => setHelpOpen(!helpOpen)}
              aria-label="Open help"
            />
          </div>
        </div>

        {/* Entity Type Tabs */}
        <div className="entity-tabs">
          {ENTITY_TYPES.map((type) => (
            <button
              key={type}
              className={`entity-tab ${selectedEntityType === type ? 'active' : ''}`}
              onClick={() => handleEntityTypeChange(type)}
              aria-selected={selectedEntityType === type}
              role="tab"
            >
              {type}
            </button>
          ))}
        </div>

        {/* Search & Filter Toolbar */}
        <div className="toolbar">
          <div className="toolbar-search">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Search by name or label..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
              aria-label="Search custom fields"
            />
          </div>

          <details className="toolbar-filters">
            <summary>
              <SVGIcon name="settings" size={16} />
              Filters & Sort
            </summary>
            <div className="toolbar-menu">
              <select
                value={filterByType}
                onChange={(e) => setFilterByType(e.target.value)}
                className="form-select"
                aria-label="Filter by field type"
              >
                <option value="">All Types</option>
                {FIELD_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {FIELD_TYPE_LABELS[type]}
                  </option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'name' | 'type' | 'created')}
                className="form-select"
                aria-label="Sort by"
              >
                <option value="name">Sort by Name</option>
                <option value="type">Sort by Type</option>
                <option value="created">Sort by Created Date</option>
              </select>
            </div>
          </details>
        </div>

        {/* Batch Actions */}
        {selectedFields.size > 0 && (
          <div className="batch-actions">
            <span>
              {selectedFields.size} field{selectedFields.size !== 1 ? 's' : ''} selected
            </span>
            <button
              className="btn btn-secondary"
              onClick={handleBatchEnable}
              title="Enable selected fields"
            >
              Enable
            </button>
            <button
              className="btn btn-secondary"
              onClick={handleBatchDisable}
              title="Disable selected fields"
            >
              Disable
            </button>
            <button
              className="btn btn-danger"
              onClick={handleBatchDelete}
              title="Delete selected fields"
            >
              <SVGIcon name="delete" size={16} />
              Delete
            </button>
          </div>
        )}

        {/* Fields Table */}
        {loading ? (
          <div className="loading-state">
            <div className="spinner" />
            <span>Loading fields...</span>
          </div>
        ) : filteredAndSortedFields.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <h3 className="empty-state-title">No custom fields found</h3>
            <p className="empty-state-description">
              {searchQuery || filterByType
                ? 'Try adjusting your search or filter criteria'
                : 'Create your first custom field to get started'}
            </p>
            <button className="btn btn-primary" onClick={handleCreateField}>
              <SVGIcon name="plus" size={16} />
              Add Custom Field
            </button>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="fields-table" role="grid">
              <thead>
                <tr>
                  <th style={{ width: '40px' }}>
                    <input
                      type="checkbox"
                      onChange={handleSelectAll}
                      checked={selectedFields.size === filteredAndSortedFields.length && selectedFields.size > 0}
                      aria-label="Select all fields"
                    />
                  </th>
                  <th scope="col">Field Name</th>
                  <th scope="col">Label</th>
                  <th scope="col">Type</th>
                  <th scope="col">Required</th>
                  <th scope="col">Status</th>
                  <th scope="col" aria-label="Actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedFields.map((field) => (
                  <tr
                    key={field.id}
                    className={`${!field.isActive ? 'inactive' : ''} ${field.required ? 'required' : ''}`}
                    role="row"
                  >
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedFields.has(field.id)}
                        onChange={() => handleSelectField(field.id)}
                        aria-label={`Select ${field.fieldLabel}`}
                      />
                    </td>
                    <td>
                      <code className="field-name">{field.fieldName}</code>
                    </td>
                    <td>{field.fieldLabel}</td>
                    <td>
                      <span className="badge">
                        {FIELD_TYPE_LABELS[field.fieldType] || field.fieldType}
                      </span>
                    </td>
                    <td>
                      {field.required ? (
                        <SVGIcon name="check" size={16} color="var(--color-success)" />
                      ) : (
                        <span style={{ color: 'var(--text-tertiary)' }}>—</span>
                      )}
                    </td>
                    <td>
                      <span className={`status-badge ${field.isActive ? 'active' : 'inactive'}`}>
                        {field.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <IconButton
                          icon="edit"
                          variant="secondary"
                          tooltip="Edit field"
                          onClick={() => handleEditField(field)}
                          aria-label={`Edit ${field.fieldLabel}`}
                        />
                        <IconButton
                          icon="delete"
                          variant="danger"
                          tooltip="Delete field"
                          onClick={() => handleDeleteField(field.id)}
                          aria-label={`Delete ${field.fieldLabel}`}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Dialog for create/edit */}
      {showDialog && (
        <CustomFieldDialog
          mode={dialogMode}
          field={selectedField}
          entityType={selectedEntityType}
          existingFields={fields}
          onSave={handleFieldSaved}
          onCancel={() => setShowDialog(false)}
          onError={(error) => {
            const notification = createErrorNotification(error, dialogMode === 'create' ? 'create' : 'update');
            addErrorNotification(notification);
          }}
        />
      )}

      {/* Help Panel */}
      {helpOpen && (
        <HelpPanel
          isOpen={helpOpen}
          onClose={() => setHelpOpen(false)}
        />
      )}

      {/* Keyboard shortcut handler */}
      <KeyboardShortcuts onHelpToggle={() => setHelpOpen(!helpOpen)} />
    </div>
  );
};

/**
 * Keyboard shortcuts handler
 */
interface KeyboardShortcutsProps {
  onHelpToggle: () => void;
}

const KeyboardShortcuts: React.FC<KeyboardShortcutsProps> = ({ onHelpToggle }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Shift + ? to toggle help
      if (e.shiftKey && e.key === '?') {
        e.preventDefault();
        onHelpToggle();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onHelpToggle]);

  return null;
};

export default CustomFieldsManager;
