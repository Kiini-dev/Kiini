/**
 * Phase 10: Custom Fields Manager Component
 * Production-ready manager for handling custom fields across the application
 */

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import {
  CustomField,
  CustomFieldExtended,
  EntityType,
  ENTITY_TYPES,
  FIELD_TYPES,
  FIELD_TYPE_LABELS,
} from '@/types/customFields';
import customFieldsService from '@/services/customFieldsService';
import { CustomFieldRenderer } from './CustomFieldRenderer';
import CustomFieldDialog from './CustomFieldDialog';
import { IconButton } from './iconSystem';
import { categorizeError, createErrorNotification, ErrorNotification } from './errorHandling';
import { HelpPanel } from './helpSystem';
import { useAuth } from '@/_core/hooks/useAuth';
import '../styles/customFieldsManager.css';
import './designTokens.css';
import './enhancedStyles.css';

interface CustomFieldsManagerProps {
  entityType?: EntityType;
  onFieldsChange?: (fields: CustomField[]) => void;
  readonly?: boolean;
}

const normalizeField = (field: any): CustomField => {
  const normalized = {
    id: field?.id ?? field?.fieldId ?? String(field?.fieldName ?? field?.name ?? Date.now()),
    organizationId: field?.organizationId ?? '',
    entityType: field?.entityType ?? 'user',
    fieldName: field?.fieldName ?? field?.name ?? '',
    fieldLabel: field?.fieldLabel ?? field?.label ?? field?.fieldName ?? field?.name ?? '',
    fieldType: field?.fieldType ?? field?.type ?? 'text',
    fieldDescription: field?.fieldDescription ?? '',
    required: Boolean(field?.required),
    displayOrder: Number(field?.displayOrder ?? 0),
    isActive: field?.isActive ?? true,
    options: Array.isArray(field?.options) ? field.options : [],
    createdAt: field?.createdAt ?? new Date().toISOString(),
    updatedAt: field?.updatedAt ?? new Date().toISOString(),
  } as CustomField;

  return normalized;
};

const CustomFieldsManager: React.FC<CustomFieldsManagerProps> = ({
  entityType: initialEntityType,
  onFieldsChange,
  readonly = false,
}) => {
  const authState = (() => {
    try {
      return useAuth();
    } catch {
      return {
        isAuthenticated: true,
        loading: false,
      };
    }
  })();

  const { isAuthenticated, loading: authLoading } = authState;

  // State
  const [selectedEntityType, setSelectedEntityType] = useState<EntityType | undefined>(
    initialEntityType ?? ENTITY_TYPES[0]
  );
  const [fields, setFields] = useState<CustomField[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<ErrorNotification[]>([]);
  const [selectedField, setSelectedField] = useState<CustomField | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'type' | 'order'>('order');
  const [filterByType, setFilterByType] = useState<string>('');
  const [helpOpen, setHelpOpen] = useState(false);
  const [selectedFields, setSelectedFields] = useState<Set<string>>(new Set());
  const selectAllCheckboxRef = useRef<HTMLInputElement | null>(null);

  /**
   * Load custom fields for selected entity type
   */
  const loadFields = useCallback(async () => {
    if (!selectedEntityType) return;
    // Only load if user is authenticated
    if (!isAuthenticated) {
      console.warn('[CustomFieldsManager] Skipping field load - user not authenticated');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await customFieldsService.getFields(selectedEntityType);
      const sourceFields = Array.isArray(response)
        ? response
        : Array.isArray((response as any)?.fields)
          ? (response as any).fields
          : [];
      const normalizedFields = sourceFields.map(normalizeField);

      setFields(normalizedFields);
      onFieldsChange?.(normalizedFields);
    } catch (err) {
      const categorized = categorizeError(err);
      setError(categorized.userMessage);
      const notification = createErrorNotification(categorized, 'fetch');
      setNotifications(prev => [...prev, notification]);
      console.error('Error loading custom fields:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedEntityType, onFieldsChange, isAuthenticated]);

  /**
   * Load fields when entity type changes or user authenticates
   */
  useEffect(() => {
    // Skip loading if auth is still loading or user is not authenticated
    if (authLoading || !isAuthenticated) {
      console.log('[CustomFieldsManager] Skipping load: authLoading=' + authLoading + ', isAuthenticated=' + isAuthenticated);
      return;
    }
    loadFields();
  }, [loadFields, isAuthenticated, authLoading]);

  /**
   * Handle Shift+? keyboard shortcut for help
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.shiftKey && e.key === '?') {
        e.preventDefault();
        setHelpOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  /**
   * Handle entity type change
   */
  const handleEntityTypeChange = (newEntityType: EntityType | undefined) => {
    setSelectedEntityType(newEntityType);
    setSelectedField(null);
    setSearchQuery('');
  };

  /**
   * Handle create field
   */
  const handleCreateField = () => {
    setSelectedField(null);
    setDialogMode('create');
    setShowDialog(true);
  };

  /**
   * Handle edit field
   */
  const handleEditField = (field: CustomField) => {
    setSelectedField(field);
    setDialogMode('edit');
    setShowDialog(true);
  };

  /**
   * Handle delete field
   */
  const handleDeleteField = async (fieldId: string) => {
    if (!window.confirm('Are you sure you want to delete this field? This action cannot be undone.')) {
      return;
    }

    try {
      await customFieldsService.deleteField(fieldId);
      const nextFields = fields.filter(f => f.id !== fieldId);
      setFields(nextFields);
      onFieldsChange?.(nextFields);
      setSelectedField(null);
    } catch (err) {
      const categorized = categorizeError(err);
      setError(categorized.userMessage);
      const notification = createErrorNotification(categorized, 'delete');
      setNotifications(prev => [...prev, notification]);
    }
  };

  /**
   * Handle field saved from dialog
   */
  const handleFieldSaved = async (savedField: CustomField) => {
    const savedFieldAny = savedField as any;
    const legacyShape = !('fieldName' in savedFieldAny || 'fieldLabel' in savedFieldAny || 'fieldType' in savedFieldAny)
      && ('name' in savedFieldAny || 'label' in savedFieldAny || 'type' in savedFieldAny);

    let finalField = normalizeField(savedField);

    if (legacyShape) {
      try {
        const legacyPayload = {
          organizationId: savedFieldAny.organizationId ?? '',
          entityType: savedFieldAny.entityType ?? selectedEntityType ?? 'user',
          fieldName: savedFieldAny.fieldName ?? savedFieldAny.name ?? '',
          fieldLabel: savedFieldAny.fieldLabel ?? savedFieldAny.label ?? '',
          fieldType: savedFieldAny.fieldType ?? savedFieldAny.type ?? 'text',
          fieldDescription: savedFieldAny.fieldDescription ?? '',
          required: Boolean(savedFieldAny.required),
          displayOrder: savedFieldAny.displayOrder ?? 0,
          options: Array.isArray(savedFieldAny.options) ? savedFieldAny.options : [],
        };

        if (dialogMode === 'create') {
          const created = await customFieldsService.createField(legacyPayload as any);
          finalField = normalizeField(created ?? { ...legacyPayload, id: legacyPayload.fieldName });
        } else if ((savedField as any).id) {
          const updated = await customFieldsService.updateField(String((savedField as any).id), {
            fieldLabel: legacyPayload.fieldLabel,
            fieldDescription: legacyPayload.fieldDescription,
            required: legacyPayload.required,
            displayOrder: legacyPayload.displayOrder,
            options: legacyPayload.options,
          });
          finalField = normalizeField(updated ?? { ...legacyPayload, id: String((savedField as any).id) });
        }
      } catch (err) {
        const categorized = categorizeError(err);
        setError(categorized.userMessage);
        const notification = createErrorNotification(categorized, 'update');
        setNotifications(prev => [...prev, notification]);
        return;
      }
    }

    if (dialogMode === 'create') {
      const newFields = [...fields, finalField];
      setFields(newFields);
      onFieldsChange?.(newFields);
    } else {
      const newFields = fields.map(f => (f.id === finalField.id ? finalField : f));
      setFields(newFields);
      onFieldsChange?.(newFields);
    }
    if (legacyShape) {
      await loadFields();
    } else {
      const refreshed = [...fields, finalField];
      setFields(refreshed);
      onFieldsChange?.(refreshed);
    }
    setShowDialog(false);
    setSelectedField(null);
  };

  const dismissNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  /**
   * Toggle field selection
   */
  const toggleFieldSelection = (fieldId: string) => {
    const newSelected = new Set(selectedFields);
    if (newSelected.has(fieldId)) {
      newSelected.delete(fieldId);
    } else {
      newSelected.add(fieldId);
    }
    setSelectedFields(newSelected);
  };

  /**
   * Toggle select all
   */
  const toggleSelectAll = () => {
    if (filteredAndSortedFields.length === 0) return;
    if (selectedFields.size === filteredAndSortedFields.length) {
      setSelectedFields(new Set());
    } else {
      setSelectedFields(new Set(filteredAndSortedFields.map(f => f.id)));
    }
  };

  /**
   * Handle batch delete
   */
  const handleBatchDelete = async () => {
    if (!window.confirm(`Delete ${selectedFields.size} fields? This action cannot be undone.`)) {
      return;
    }

    try {
      for (const fieldId of Array.from(selectedFields)) {
        await customFieldsService.deleteField(fieldId);
      }
      const newFields = fields.filter(f => !selectedFields.has(f.id));
      setFields(newFields);
      onFieldsChange?.(newFields);
      setSelectedFields(new Set());
    } catch (err) {
      const categorized = categorizeError(err);
      setError(categorized.userMessage);
      const notification = createErrorNotification(categorized, 'delete');
      setNotifications(prev => [...prev, notification]);
    }
  };

  /**
   * Filter and sort fields
   */
  const filteredAndSortedFields = useMemo(() => {
    const safeFields = Array.isArray(fields) ? fields : [];
    let result = [...safeFields];

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        f =>
          f.fieldLabel.toLowerCase().includes(query) ||
          f.fieldName.toLowerCase().includes(query) ||
          f.fieldDescription?.toLowerCase().includes(query)
      );
    }

    // Filter by type
    if (filterByType) {
      result = result.filter(f => f.fieldType === filterByType);
    }

    // Sort
    switch (sortBy) {
      case 'name':
        result.sort((a, b) => a.fieldLabel.localeCompare(b.fieldLabel));
        break;
      case 'type':
        result.sort((a, b) => a.fieldType.localeCompare(b.fieldType));
        break;
      case 'order':
      default:
        result.sort((a, b) => a.displayOrder - b.displayOrder);
        break;
    }

    return result;
  }, [fields, searchQuery, filterByType, sortBy]);

  useEffect(() => {
    if (selectAllCheckboxRef.current) {
      selectAllCheckboxRef.current.indeterminate =
        selectedFields.size > 0 && selectedFields.size < filteredAndSortedFields.length;
    }
  }, [selectedFields, filteredAndSortedFields]);

  /**
   * Render empty state
   */
  const renderEmptyState = () => (
    <div className="empty-state">
      <p>No custom fields found.</p>
      <p className="hint">Create your first custom field to get started.</p>
      {!readonly && (
        <button className="btn btn-primary" onClick={handleCreateField} style={{ marginTop: '1rem' }}>
          Create New Field
        </button>
      )}
    </div>
  );

  /**
   * Render fields table
   */
  const renderFieldsTable = () => (
    <div className="fields-container">
      {filteredAndSortedFields.length === 0 ? (
        renderEmptyState()
      ) : (
        <>
          {/* Batch Actions Bar */}
          {selectedFields.size > 0 && !readonly && (
            <div style={{
              background: '#f0f9ff',
              border: '1px solid #0284c7',
              borderRadius: '0.375rem',
              padding: '0.75rem 1rem',
              marginBottom: '1rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{ fontWeight: 500 }}>
                {selectedFields.size} field{selectedFields.size === 1 ? '' : 's'} selected
              </span>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  className="btn btn-danger"
                  onClick={handleBatchDelete}
                >
                  Delete Selected
                </button>
                <button
                  className="btn"
                  onClick={() => setSelectedFields(new Set())}
                >
                  Clear Selection
                </button>
              </div>
            </div>
          )}
          <Table>
            <TableHeader>
              <TableRow>
                {!readonly && (
                  <TableHead style={{ width: '3rem', textAlign: 'center' }}>
                    <input
                      ref={selectAllCheckboxRef}
                      type="checkbox"
                      checked={selectedFields.size === filteredAndSortedFields.length && filteredAndSortedFields.length > 0}
                      onChange={toggleSelectAll}
                      title="Select all fields"
                      aria-label="Select all fields"
                    />
                  </TableHead>
                )}
                <TableHead>Name</TableHead>
                <TableHead>Label</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Required</TableHead>
                <TableHead>Status</TableHead>
                {!readonly && <TableHead>Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedFields.map(field => (
                <TableRow
                  key={field.id}
                  className={`${!field.isActive ? 'inactive' : ''} ${selectedFields.has(field.id) ? 'selected' : ''}`.trim()}
                  style={selectedFields.has(field.id) ? { background: '#f0f9ff' } : {}}
                >
                  {!readonly && (
                    <TableCell style={{ textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={selectedFields.has(field.id)}
                        onChange={() => toggleFieldSelection(field.id)}
                        title={`Select ${field.fieldLabel}`}
                        aria-label={`Select field ${field.fieldLabel}`}
                      />
                    </TableCell>
                  )}
                  <TableCell>
                    <span className="font-mono">{field.fieldName}</span>
                  </TableCell>
                  <TableCell>{field.fieldLabel}</TableCell>
                  <TableCell>{FIELD_TYPE_LABELS[field.fieldType]}</TableCell>
                  <TableCell>{field.required ? '✓' : '—'}</TableCell>
                  <TableCell>
                    {field.isActive ? (
                      <span style={{ color: '#059669' }}>Active</span>
                    ) : (
                      <span style={{ color: '#d97706' }}>Inactive</span>
                    )}
                  </TableCell>
                  {!readonly && (
                    <TableCell>
                      <div className="actions">
                        <IconButton
                          icon="edit"
                          variant="primary"
                          tooltip="Edit field"
                          aria-label="Edit field"
                          onClick={() => handleEditField(field)}
                        />
                        <IconButton
                          icon="delete"
                          variant="danger"
                          tooltip="Delete field"
                          aria-label="Delete field"
                          onClick={() => handleDeleteField(field.id)}
                        />
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </>
      )}
    </div>
  );

  return (
    <div className="custom-fields-manager">
      {/* Help Panel */}
      <HelpPanel isOpen={helpOpen} onClose={() => setHelpOpen(false)} />
      {/* Header */}
      <div className="manager-header">
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <h1>Custom Fields Manager</h1>
          <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Fields ({fields.length})</span>
          <IconButton
            icon="help"
            variant="ghost"
            tooltip="Open help (Shift+?)"
            aria-label="Open help panel"
            onClick={() => setHelpOpen(true)}
            iconSize={20}
          />
        </div>
        <p className="subtitle">
          {selectedEntityType
            ? `Manage custom fields for ${selectedEntityType}`
            : 'Select an entity type to manage custom fields'}
        </p>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="error-banner">
          {error}
          <IconButton
            icon="x"
            variant="ghost"
            tooltip="Close error"
            aria-label="Close error notification"
            onClick={() => setError(null)}
            style={{ marginLeft: '1rem' }}
          />
        </div>
      )}

      {notifications.length > 0 && (
        <div className="notification-stack" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
          {notifications.map(notification => (
            <div key={notification.id} className="notification-item" style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              border: '1px solid #fbbf24',
              borderRadius: '0.5rem',
              padding: '0.75rem 1rem',
              background: '#fff7ed',
            }}>
              <span>{notification.message}</span>
              <IconButton
                icon="x"
                variant="ghost"
                tooltip="Dismiss notification"
                aria-label="Dismiss notification"
                onClick={() => dismissNotification(notification.id)}
              />
            </div>
          ))}
        </div>
      )}

      {/* Entity Type Selector and Actions */}
      <div className="entity-tabs">
        <div className="tabs">
          <button
            className={`tab ${!selectedEntityType ? 'active' : ''}`}
            onClick={() => handleEntityTypeChange(undefined)}
          >
            All Types
          </button>
          {ENTITY_TYPES.map(type => (
            <button
              key={type}
              className={`tab ${selectedEntityType === type ? 'active' : ''}`}
              onClick={() => handleEntityTypeChange(type)}
            >
              {type}
            </button>
          ))}
        </div>
        {!readonly && selectedEntityType && (
          <button className="btn btn-primary" onClick={handleCreateField}>
            Create New Field
          </button>
        )}
      </div>

      {/* Search and Filter */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '250px' }}>
          <input
            type="text"
            className="form-input"
            placeholder="Search fields..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        <div>
          <select
            className="form-select"
            value={filterByType}
            onChange={e => setFilterByType(e.target.value)}
          >
            <option value="">All Types</option>
            {FIELD_TYPES.map(type => (
              <option key={type} value={type}>
                {FIELD_TYPE_LABELS[type]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <select
            className="form-select"
            value={sortBy}
            onChange={e => setSortBy(e.target.value as 'name' | 'type' | 'order')}
          >
            <option value="order">Sort by Order</option>
            <option value="name">Sort by Name</option>
            <option value="type">Sort by Type</option>
          </select>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="loading-message">Loading fields...</div>
      ) : selectedEntityType ? (
        renderFieldsTable()
      ) : (
        <div className="empty-state">
          <p>Select an entity type to view and manage custom fields.</p>
        </div>
      )}

      {/* Custom Field Dialog */}
      {showDialog && (
        <CustomFieldDialog
          isOpen={showDialog}
          mode={dialogMode}
          field={selectedField}
          entityType={selectedEntityType}
          onSave={handleFieldSaved}
          onCancel={() => setShowDialog(false)}
          onClose={() => setShowDialog(false)}
        />
      )}
    </div>
  );
};

export default CustomFieldsManager;
export { CustomFieldsManager };
