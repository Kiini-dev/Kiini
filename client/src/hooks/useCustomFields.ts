/**
 * Phase 10: useCustomFields Hook
 * Manages custom fields operations via API
 */

import { useState, useCallback, useEffect } from 'react';
import { CustomField, CreateCustomFieldInput, UpdateCustomFieldInput, FieldValidationRule, FieldValidation } from '../types/customFields';
import { COOKIE_NAME } from '@shared/const';

const API_BASE = '/api/customFields';

/**
 * Get authorization headers with JWT token
 */
function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('auth-token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
}

export function useCustomFields(organizationId?: string) {
  const [fields, setFields] = useState<CustomField[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch all custom fields for an entity type
   */
  const getFieldsByEntity = useCallback(async (entityType: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}?entityType=${entityType}`, {
        headers: getAuthHeaders(),
        credentials: 'include',
      });
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized: Please log in');
        }
        throw new Error(`Failed to fetch fields: ${response.statusText}`);
      }
      const data = await response.json();
      setFields(data || []);
      return data || [];
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMsg);
      console.error('Error fetching custom fields:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get a single custom field by ID
   */
  const getField = useCallback(async (id: string) => {
    try {
      const response = await fetch(`${API_BASE}/${id}`, {
        headers: getAuthHeaders(),
        credentials: 'include',
      });
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized: Please log in');
        }
        throw new Error(`Failed to fetch field: ${response.statusText}`);
      }
      return await response.json();
    } catch (err) {
      console.error('Error fetching custom field:', err);
      return null;
    }
  }, []);

  /**
   * Create a new custom field
   */
  const createField = useCallback(async (input: CreateCustomFieldInput) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(API_BASE, {
        method: 'POST',
        headers: getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify(input),
      });
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized: Please log in');
        }
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to create field: ${response.statusText}`);
      }
      const newField = await response.json();
      setFields(prev => [...prev, newField]);
      return newField;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMsg);
      console.error('Error creating custom field:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Update a custom field
   */
  const updateField = useCallback(async (id: string, input: UpdateCustomFieldInput) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify(input),
      });
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized: Please log in');
        }
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to update field: ${response.statusText}`);
      }
      const updatedField = await response.json();
      setFields(prev => prev.map(f => f.id === id ? updatedField : f));
      return updatedField;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMsg);
      console.error('Error updating custom field:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Delete a custom field
   */
  const deleteField = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
        credentials: 'include',
      });
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized: Please log in');
        }
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to delete field: ${response.statusText}`);
      }
      setFields(prev => prev.filter(f => f.id !== id));
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMsg);
      console.error('Error deleting custom field:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Validate a field value
   */
  const validateValue = useCallback(async (customFieldId: string, value: any) => {
    try {
      const response = await fetch(`${API_BASE}/${customFieldId}/validate`, {
        method: 'POST',
        headers: getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify({ value }),
      });
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized: Please log in');
        }
        throw new Error(`Failed to validate: ${response.statusText}`);
      }
      return await response.json();
    } catch (err) {
      console.error('Error validating value:', err);
      return { valid: false, error: 'Validation error' };
    }
  }, []);

  /**
   * Add validation rule to custom field
   */
  const addValidation = useCallback(async (customFieldId: string, rule: FieldValidationRule) => {
    try {
      const response = await fetch(`${API_BASE}/${customFieldId}/validations`, {
        method: 'POST',
        headers: getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify(rule),
      });
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized: Please log in');
        }
        throw new Error(`Failed to add validation: ${response.statusText}`);
      }
      return await response.json();
    } catch (err) {
      console.error('Error adding validation:', err);
      throw err;
    }
  }, []);

  /**
   * Get validation rules for a field
   */
  const getValidations = useCallback(async (customFieldId: string) => {
    try {
      const response = await fetch(`${API_BASE}/${customFieldId}/validations`, {
        headers: getAuthHeaders(),
        credentials: 'include',
      });
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized: Please log in');
        }
        throw new Error(`Failed to fetch validations: ${response.statusText}`);
      }
      return await response.json();
    } catch (err) {
      console.error('Error fetching validations:', err);
      return [];
    }
  }, []);

  return {
    fields,
    loading,
    error,
    getFieldsByEntity,
    getField,
    createField,
    updateField,
    deleteField,
    validateValue,
    addValidation,
    getValidations,
  };
}
