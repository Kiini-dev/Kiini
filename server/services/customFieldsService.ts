import { eq, and, desc, asc } from 'drizzle-orm';
import { v4 as uuid } from 'uuid';
import { getDb } from '../db';
import { customFields, fieldValidations, fieldValues } from '../../drizzle/schema';

export interface CreateCustomFieldInput {
  organizationId: string;
  entityType: string;
  fieldName: string;
  fieldLabel: string;
  fieldType: 'text' | 'number' | 'date' | 'select' | 'multiSelect' | 'checkbox' | 'richText' | 'file' | 'currency';
  fieldDescription?: string;
  required?: boolean;
  displayOrder?: number;
  options?: string[];
}

export interface UpdateCustomFieldInput {
  fieldLabel?: string;
  fieldDescription?: string;
  required?: boolean;
  displayOrder?: number;
  isActive?: boolean;
  options?: string[];
}

export interface FieldValidationRule {
  ruleType: string;
  ruleValue: any;
  errorMessage: string;
}

export interface FieldValueInput {
  customFieldId: string;
  entityId: string;
  entityType: string;
  organizationId: string;
  value: any;
}

export class CustomFieldsService {
  private db: any;

  constructor() {
    this.db = null;
  }

  private async getDatabase() {
    if (!this.db) {
      this.db = await getDb();
    }
    return this.db;
  }

  /**
   * Get all custom fields for an entity type
   */
  async getFieldsByEntity(organizationId: string, entityType: string) {
    try {
      const db = await this.getDatabase();
      return db.select()
        .from(customFields)
        .where(and(
          eq(customFields.organizationId, organizationId),
          eq(customFields.entityType, entityType),
          eq(customFields.isActive, 1)
        ))
        .orderBy(asc(customFields.displayOrder));
    } catch (error) {
      console.warn("[CustomFields] getFieldsByEntity failed:", error);
      return [];
    }
  }

  /**
   * Get single custom field by ID
   */
  async getField(id: string) {
    const db = await this.getDatabase();
    const result = await db.select().from(customFields).where(eq(customFields.id, id)).limit(1);
    return result[0] || null;
  }

  /**
   * Create new custom field
   */
  async createField(input: CreateCustomFieldInput) {
    const db = await this.getDatabase();
    const id = uuid();
    
    const newField = {
      id,
      organizationId: input.organizationId,
      entityType: input.entityType,
      fieldName: input.fieldName,
      fieldLabel: input.fieldLabel,
      fieldType: input.fieldType,
      fieldDescription: input.fieldDescription || null,
      required: input.required ? 1 : 0,
      displayOrder: input.displayOrder || 0,
      isActive: 1,
      options: input.options ? JSON.stringify(input.options) : null,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };

    await db.insert(customFields).values(newField);
    return this.getField(id);
  }

  /**
   * Update custom field
   */
  async updateField(id: string, input: UpdateCustomFieldInput) {
    const db = await this.getDatabase();
    
    const updateData: any = {
      updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };

    if (input.fieldLabel !== undefined) updateData.fieldLabel = input.fieldLabel;
    if (input.fieldDescription !== undefined) updateData.fieldDescription = input.fieldDescription;
    if (input.required !== undefined) updateData.required = input.required ? 1 : 0;
    if (input.displayOrder !== undefined) updateData.displayOrder = input.displayOrder;
    if (input.isActive !== undefined) updateData.isActive = input.isActive ? 1 : 0;
    if (input.options !== undefined) updateData.options = JSON.stringify(input.options);

    await db.update(customFields).set(updateData).where(eq(customFields.id, id));
    return this.getField(id);
  }

  /**
   * Delete custom field (soft delete - deactivate)
   */
  async deleteField(id: string) {
    const db = await this.getDatabase();
    
    // Cascade delete: remove field values and validations
    await db.delete(fieldValues).where(eq(fieldValues.fieldId, id));
    await db.delete(fieldValidations).where(eq(fieldValidations.fieldId, id));
    
    // Soft delete the field itself
    await db.update(customFields).set({ isActive: 0 }).where(eq(customFields.id, id));
    return { success: true };
  }

  /**
   * Add validation rule to custom field
   */
  async addValidation(customFieldId: string, rule: FieldValidationRule) {
    const db = await this.getDatabase();
    const id = uuid();

    await db.insert(fieldValidations).values({
      id,
      fieldId: customFieldId,
      validationType: rule.ruleType,
      validationValue: JSON.stringify({ value: rule.ruleValue, errorMessage: rule.errorMessage }),
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
    });

    return { id, ...rule };
  }

  /**
   * Get validation rules for a field
   */
  async getFieldValidations(customFieldId: string) {
    const db = await this.getDatabase();
    const results = await db.select().from(fieldValidations).where(eq(fieldValidations.fieldId, customFieldId));
    
    return results.map((rule: any) => ({
      id: rule.id,
      customFieldId: rule.fieldId,
      ruleType: rule.validationType,
      ruleValue: JSON.parse(rule.validationValue || '{}').value,
      errorMessage: JSON.parse(rule.validationValue || '{}').errorMessage,
    }));
  }

  /**
   * Validate a field value
   */
  async validateValue(customFieldId: string, value: any): Promise<{ valid: boolean; error?: string }> {
    const field = await this.getField(customFieldId);
    if (!field) {
      return { valid: false, error: 'Field not found' };
    }

    const validations = await this.getFieldValidations(customFieldId);

    for (const validation of validations) {
      const result = this.checkValidation(field.fieldType, value, validation);
      if (!result.valid) {
        return { valid: false, error: result.error };
      }
    }

    return { valid: true };
  }

  /**
   * Check individual validation rule
   */
  private checkValidation(fieldType: string, value: any, validation: any): { valid: boolean; error?: string } {
    const { ruleType, ruleValue, errorMessage } = validation;

    switch (ruleType) {
      case 'required':
        if (value === null || value === undefined || value === '') {
          return { valid: false, error: errorMessage || 'This field is required' };
        }
        return { valid: true };

      case 'minLength':
        if (String(value).length < parseInt(ruleValue.value || ruleValue)) {
          return { valid: false, error: errorMessage || `Minimum length is ${ruleValue.value || ruleValue}` };
        }
        return { valid: true };

      case 'maxLength':
        if (String(value).length > parseInt(ruleValue.value || ruleValue)) {
          return { valid: false, error: errorMessage || `Maximum length is ${ruleValue.value || ruleValue}` };
        }
        return { valid: true };

      case 'pattern':
        try {
          const regex = new RegExp(ruleValue.pattern || ruleValue);
          if (!regex.test(String(value))) {
            return { valid: false, error: errorMessage || 'Invalid format' };
          }
        } catch (e) {
          return { valid: false, error: 'Invalid validation pattern' };
        }
        return { valid: true };

      case 'range':
        const num = Number(value);
        const min = Number(ruleValue.min || ruleValue);
        const max = Number(ruleValue.max !== undefined ? ruleValue.max : (ruleValue.split(',')[1] || Infinity));
        if (isNaN(num) || num < min || num > max) {
          return { valid: false, error: errorMessage || `Value must be between ${min} and ${max}` };
        }
        return { valid: true };

      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(String(value))) {
          return { valid: false, error: errorMessage || 'Invalid email format' };
        }
        return { valid: true };

      case 'phone':
        const phoneRegex = /^\d{3,15}$/;
        const cleanPhone = String(value).replace(/\D/g, '');
        if (!phoneRegex.test(cleanPhone)) {
          return { valid: false, error: errorMessage || 'Invalid phone format' };
        }
        return { valid: true };

      default:
        return { valid: true };
    }
  }

  /**
   * Save field value
   */
  async setFieldValue(input: FieldValueInput) {
    const db = await this.getDatabase();
    
    // Validate the value first
    const validation = await this.validateValue(input.customFieldId, input.value);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // Check if value exists
    const existing = await db.select().from(fieldValues).where(
      and(
        eq(fieldValues.fieldId, input.customFieldId),
        eq(fieldValues.entityId, input.entityId)
      )
    ).limit(1);

    const valueRecord = {
      fieldId: input.customFieldId,
      entityId: input.entityId,
      value: typeof input.value === 'string' ? input.value : JSON.stringify(input.value),
      updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };

    if (existing.length > 0) {
      // Update existing
      await db.update(fieldValues).set(valueRecord).where(eq(fieldValues.id, existing[0].id));
      return { id: existing[0].id, ...valueRecord };
    } else {
      // Insert new
      const id = uuid();
      await db.insert(fieldValues).values({
        id,
        ...valueRecord,
        createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      });
      return { id, ...valueRecord };
    }
  }

  /**
   * Get all field values for an entity
   */
  async getEntityFieldValues(organizationId: string, entityId: string, entityType: string) {
    const db = await this.getDatabase();
    
    const fields = await db.select().from(customFields).where(
      and(
        eq(customFields.organizationId, organizationId),
        eq(customFields.entityType, entityType),
        eq(customFields.isActive, 1)
      )
    );

    const values = await db.select().from(fieldValues).where(
      and(
        eq(fieldValues.entityId, entityId),
      )
    );

    // Build result with all fields and their values (or empty if not set)
    return fields.map((field: any) => {
      const value = values.find((v: any) => v.fieldId === field.id);
      return {
        customFieldId: field.id,
        fieldName: field.fieldName,
        fieldLabel: field.fieldLabel,
        fieldType: field.fieldType,
        value: value ? (
          typeof value.value === 'string' && (field.fieldType === 'multiSelect' || value.value.startsWith('['))
            ? JSON.parse(value.value)
            : value.value
        ) : null,
      };
    });
  }

  /**
   * Bulk delete field values for an entity (when entity is deleted)
   */
  async deleteEntityFieldValues(entityId: string) {
    const db = await this.getDatabase();
    await db.delete(fieldValues).where(eq(fieldValues.entityId, entityId));
    return { success: true };
  }
}

// Export instance for use in routers
export const customFieldsService = new CustomFieldsService();
