/**
 * Phase 10: Custom Fields API Service
 */

import apiClient from '@/utils/apiClient';
import {
  CustomField,
  CustomFieldExtended,
  CreateCustomFieldInput,
  UpdateCustomFieldInput,
  FieldValidationRule,
  FieldValidation,
  ValidationResult,
  CustomFieldsAPIResponse,
  EntityType,
  CustomFieldsMapping,
} from '@/types/customFields';

/**
 * Custom Fields API Service
 * Handles all API communication for custom fields management
 */
class CustomFieldsService {
  private endpoint = '/api/customFields';

  /**
   * Fetch all custom fields for an organization/entity type
   */
  async getFields(
    entityType?: EntityType,
    organizationId?: string,
    options?: { page?: number; pageSize?: number }
  ): Promise<CustomFieldsAPIResponse> {
    try {
      const params = new URLSearchParams();
      if (entityType) params.append('entityType', entityType);
      if (organizationId) params.append('organizationId', organizationId);
      if (options?.page) params.append('page', String(options.page));
      if (options?.pageSize) params.append('pageSize', String(options.pageSize));

      const response = await apiClient.get<CustomFieldsAPIResponse>(
        `${this.endpoint}${params.toString() ? `?${params.toString()}` : ''}`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching custom fields:', error);
      throw error;
    }
  }

  /**
   * Fetch a single custom field by ID
   */
  async getField(fieldId: string): Promise<CustomFieldExtended> {
    try {
      const response = await apiClient.get<CustomFieldExtended>(`${this.endpoint}/${fieldId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching custom field ${fieldId}:`, error);
      throw error;
    }
  }

  /**
   * Create a new custom field
   */
  async createField(input: CreateCustomFieldInput): Promise<CustomField> {
    try {
      const response = await apiClient.post<CustomField>(this.endpoint, input);
      return response.data;
    } catch (error) {
      console.error('Error creating custom field:', error);
      throw error;
    }
  }

  /**
   * Update an existing custom field
   */
  async updateField(fieldId: string, input: UpdateCustomFieldInput): Promise<CustomField> {
    try {
      const response = await apiClient.put<CustomField>(`${this.endpoint}/${fieldId}`, input);
      return response.data;
    } catch (error) {
      console.error(`Error updating custom field ${fieldId}:`, error);
      throw error;
    }
  }

  /**
   * Delete a custom field
   */
  async deleteField(fieldId: string): Promise<void> {
    try {
      await apiClient.delete(`${this.endpoint}/${fieldId}`);
    } catch (error) {
      console.error(`Error deleting custom field ${fieldId}:`, error);
      throw error;
    }
  }

  /**
   * Reorder custom fields
   */
  async reorderFields(
    fields: Array<{ id: string; displayOrder: number }>,
    entityType: EntityType
  ): Promise<CustomField[]> {
    try {
      const response = await apiClient.post<CustomField[]>(
        `${this.endpoint}/reorder`,
        { fields, entityType }
      );
      return response.data;
    } catch (error) {
      console.error('Error reordering custom fields:', error);
      throw error;
    }
  }

  /**
   * Validate a custom field value
   */
  async validateValue(
    customFieldId: string,
    value: any
  ): Promise<{ valid: boolean; error?: string }> {
    try {
      const response = await apiClient.post<{ valid: boolean; error?: string }>(
        `${this.endpoint}/${customFieldId}/validate`,
        { value }
      );
      return response.data;
    } catch (error) {
      console.error(`Error validating custom field ${customFieldId}:`, error);
      throw error;
    }
  }

  /**
   * Validate multiple custom field values
   */
  async validateValues(
    fields: Array<{ fieldId: string; value: any }>
  ): Promise<ValidationResult> {
    try {
      const response = await apiClient.post<ValidationResult>(
        `${this.endpoint}/validate-bulk`,
        { fields }
      );
      return response.data;
    } catch (error) {
      console.error('Error validating custom fields:', error);
      throw error;
    }
  }

  /**
   * Add a validation rule to a custom field
   */
  async addValidation(customFieldId: string, rule: FieldValidationRule): Promise<FieldValidation> {
    try {
      const response = await apiClient.post<FieldValidation>(
        `${this.endpoint}/${customFieldId}/validations`,
        rule
      );
      return response.data;
    } catch (error) {
      console.error(`Error adding validation to field ${customFieldId}:`, error);
      throw error;
    }
  }

  /**
   * Get all validations for a custom field
   */
  async getValidations(customFieldId: string): Promise<FieldValidation[]> {
    try {
      const response = await apiClient.get<FieldValidation[]>(
        `${this.endpoint}/${customFieldId}/validations`
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching validations for field ${customFieldId}:`, error);
      throw error;
    }
  }

  /**
   * Update a validation rule
   */
  async updateValidation(
    customFieldId: string,
    validationId: string,
    rule: Partial<FieldValidationRule>
  ): Promise<FieldValidation> {
    try {
      const response = await apiClient.put<FieldValidation>(
        `${this.endpoint}/${customFieldId}/validations/${validationId}`,
        rule
      );
      return response.data;
    } catch (error) {
      console.error(
        `Error updating validation ${validationId} for field ${customFieldId}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Delete a validation rule
   */
  async deleteValidation(customFieldId: string, validationId: string): Promise<void> {
    try {
      await apiClient.delete(
        `${this.endpoint}/${customFieldId}/validations/${validationId}`
      );
    } catch (error) {
      console.error(
        `Error deleting validation ${validationId} for field ${customFieldId}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Save custom field values for an entity
   */
  async saveFieldValues(
    entityId: string,
    entityType: EntityType,
    values: Record<string, any>
  ): Promise<CustomFieldsMapping> {
    try {
      const response = await apiClient.post<CustomFieldsMapping>(
        `${this.endpoint}/values`,
        {
          entityId,
          entityType,
          customFields: Object.entries(values).map(([fieldId, value]) => ({
            fieldId,
            value,
          })),
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error saving custom field values:', error);
      throw error;
    }
  }

  /**
   * Get custom field values for an entity
   */
  async getFieldValues(
    entityId: string,
    entityType: EntityType
  ): Promise<Record<string, any>> {
    try {
      const response = await apiClient.get<CustomFieldsMapping>(
        `${this.endpoint}/values/${entityType}/${entityId}`
      );
      const mapping: CustomFieldsMapping = response.data;
      return mapping.customFields.reduce(
        (acc, field) => {
          acc[field.fieldId] = field.value;
          return acc;
        },
        {} as Record<string, any>
      );
    } catch (error) {
      console.error(
        `Error fetching custom field values for ${entityType}/${entityId}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Delete custom field values for an entity
   */
  async deleteFieldValues(entityId: string, entityType: EntityType): Promise<void> {
    try {
      await apiClient.delete(`${this.endpoint}/values/${entityType}/${entityId}`);
    } catch (error) {
      console.error(
        `Error deleting custom field values for ${entityType}/${entityId}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Bulk delete custom fields
   */
  async bulkDeleteFields(fieldIds: string[]): Promise<void> {
    try {
      await apiClient.post(`${this.endpoint}/bulk-delete`, { fieldIds });
    } catch (error) {
      console.error('Error bulk deleting custom fields:', error);
      throw error;
    }
  }

  /**
   * Bulk update custom field properties
   */
  async bulkUpdateFields(
    updates: Array<{ id: string; updates: UpdateCustomFieldInput }>
  ): Promise<CustomField[]> {
    try {
      const response = await apiClient.post<CustomField[]>(
        `${this.endpoint}/bulk-update`,
        { updates }
      );
      return response.data;
    } catch (error) {
      console.error('Error bulk updating custom fields:', error);
      throw error;
    }
  }

  /**
   * Export custom fields configuration
   */
  async exportFields(entityType?: EntityType): Promise<Blob> {
    try {
      const params = new URLSearchParams();
      if (entityType) params.append('entityType', entityType);

      const response = await apiClient.get(
        `${this.endpoint}/export${params.toString() ? `?${params.toString()}` : ''}`,
        { responseType: 'blob' }
      );
      return response.data;
    } catch (error) {
      console.error('Error exporting custom fields:', error);
      throw error;
    }
  }

  /**
   * Import custom fields configuration
   */
  async importFields(file: File, entityType?: EntityType): Promise<CustomField[]> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (entityType) formData.append('entityType', entityType);

      const response = await apiClient.post<CustomField[]>(
        `${this.endpoint}/import`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error importing custom fields:', error);
      throw error;
    }
  }

  /**
   * Get field usage statistics
   */
  async getFieldUsageStats(fieldId: string): Promise<{
    fieldId: string;
    entityType: EntityType;
    usageCount: number;
    lastUsed?: Date;
    filledPercentage: number;
  }> {
    try {
      const response = await apiClient.get(
        `${this.endpoint}/${fieldId}/usage-stats`
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching usage stats for field ${fieldId}:`, error);
      throw error;
    }
  }

  /**
   * Duplicate a custom field
   */
  async duplicateField(fieldId: string, label?: string): Promise<CustomField> {
    try {
      const response = await apiClient.post<CustomField>(
        `${this.endpoint}/${fieldId}/duplicate`,
        { label }
      );
      return response.data;
    } catch (error) {
      console.error(`Error duplicating custom field ${fieldId}:`, error);
      throw error;
    }
  }

  /**
   * Search custom fields
   */
  async searchFields(query: string, entityType?: EntityType): Promise<CustomField[]> {
    try {
      const params = new URLSearchParams();
      params.append('q', query);
      if (entityType) params.append('entityType', entityType);

      const response = await apiClient.get<CustomField[]>(
        `${this.endpoint}/search?${params.toString()}`
      );
      return response.data;
    } catch (error) {
      console.error('Error searching custom fields:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const customFieldsService = new CustomFieldsService();

export default customFieldsService;
