/**
 * Phase 10: Custom Fields Type Definitions
 * Used for form customization and field management
 */

export type FieldType = 'text' | 'number' | 'date' | 'select' | 'multiSelect' | 'checkbox' | 'richText' | 'file' | 'currency' | 'email' | 'phone';

export interface SelectOption {
  value: string;
  label: string;
  order?: number;
}

export interface CustomField {
  id: string;
  organizationId: string;
  entityType: string;
  fieldName: string;
  fieldLabel: string;
  fieldType: FieldType;
  fieldDescription?: string;
  required: boolean;
  displayOrder: number;
  isActive: boolean;
  options?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface FieldValidation {
  id: string;
  customFieldId: string;
  ruleType: string;
  ruleValue: any;
  errorMessage: string;
}

export interface FieldValue {
  id: string;
  customFieldId: string;
  entityId: string;
  entityType: string;
  organizationId: string;
  value: any;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCustomFieldInput {
  organizationId: string;
  entityType: string;
  fieldName: string;
  fieldLabel: string;
  fieldType: FieldType;
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

export interface CustomFieldsContextType {
  fields: CustomField[];
  loading: boolean;
  error: string | null;
  getFieldsByEntity: (entityType: string) => Promise<CustomField[]>;
  createField: (input: CreateCustomFieldInput) => Promise<CustomField>;
  updateField: (id: string, input: UpdateCustomFieldInput) => Promise<CustomField>;
  deleteField: (id: string) => Promise<void>;
  validateValue: (customFieldId: string, value: any) => Promise<{ valid: boolean; error?: string }>;
  addValidation: (customFieldId: string, rule: FieldValidationRule) => Promise<FieldValidation>;
  getValidations: (customFieldId: string) => Promise<FieldValidation[]>;
}

export type EntityType = 'Contact' | 'Invoice' | 'Project' | 'Employee' | 'Account' | 'Opportunity' | 'Service' | 'Product' | 'user';

export const ENTITY_TYPES: EntityType[] = ['Contact', 'Invoice', 'Project', 'Employee', 'Account', 'Opportunity', 'Service', 'Product', 'user'];

export const FIELD_TYPES: FieldType[] = ['text', 'number', 'date', 'select', 'multiSelect', 'checkbox', 'richText', 'file', 'currency', 'email', 'phone'];

export const FIELD_TYPE_LABELS: Record<FieldType, string> = {
  text: 'Text',
  number: 'Number',
  date: 'Date',
  select: 'Dropdown',
  multiSelect: 'Multi-select',
  checkbox: 'Checkbox',
  richText: 'Rich Text',
  file: 'File Upload',
  currency: 'Currency',
  email: 'Email',
  phone: 'Phone',
};

export const VALIDATION_RULE_TYPES = [
  'required',
  'minLength',
  'maxLength',
  'pattern',
  'range',
  'email',
  'phone',
  'unique',
  'minimum',
  'maximum',
];

/* ============================================================
   Extended Type Definitions for Phase 10
   ============================================================ */

/**
 * Extended custom field with type-specific configurations
 */
export interface CustomFieldExtended extends CustomField {
  // General
  placeholder?: string;

  // Text field specific
  minLength?: number;
  maxLength?: number;

  // Number field specific
  minValue?: number;
  maxValue?: number;
  decimals?: number;

  // Currency field specific
  currency?: string;

  // Select/MultiSelect specific
  allowCustom?: boolean;

  // Date field specific
  minDate?: Date;
  maxDate?: Date;
  format?: string;

  // File field specific
  allowedMimeTypes?: string[];
  maxFileSize?: number;
  maxFiles?: number;

  // Rich text specific
  allowedFormats?: string[];

  // JSON field specific
  schema?: Record<string, any>;
}

/**
 * Validation result
 */
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: string[];
}

/**
 * Validation error
 */
export interface ValidationError {
  field: string;
  message: string;
  rule: string;
}

/**
 * Custom field group configuration
 */
export interface CustomFieldGroup {
  id: string;
  name: string;
  label: string;
  description?: string;
  fields: CustomField[];
  order: number;
  visible: boolean;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
}

/**
 * Custom fields mapping for an entity
 */
export interface CustomFieldsMapping {
  entityType: EntityType;
  entityId: string;
  customFields: Array<{
    fieldId: string;
    value: any;
  }>;
}

/**
 * Custom fields response from API
 */
export interface CustomFieldsAPIResponse {
  fields: CustomField[];
  total: number;
  page?: number;
  pageSize?: number;
}

/* ============================================================
   Component Props
   ============================================================ */

/**
 * Props for CustomFieldRenderer component
 */
export interface CustomFieldRendererProps {
  field: CustomFieldExtended;
  value?: any;
  onChange?: (value: any) => void;
  onBlur?: () => void;
  disabled?: boolean;
  error?: string;
  readOnly?: boolean;
  className?: string;
}

/**
 * Props for CustomFieldGroup component
 */
export interface CustomFieldGroupProps {
  group: CustomFieldGroup;
  values: Record<string, any>;
  onChange: (fieldId: string, value: any) => void;
  errors?: Record<string, string>;
  disabled?: boolean;
  readOnly?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}

/**
 * Props for CustomFieldsManager component
 */
export interface CustomFieldsManagerProps {
  entityType?: EntityType;
  onFieldsChange?: (fields: CustomField[]) => void;
  readonly?: boolean;
}

/**
 * Props for CustomFieldsForm component
 */
export interface CustomFieldsFormProps {
  fields: CustomField[];
  values?: Record<string, any>;
  onSubmit: (values: Record<string, any>) => void;
  onChange?: (fieldId: string, value: any) => void;
  disabled?: boolean;
  layout?: 'single' | 'grid';
  columns?: number;
  className?: string;
}

/* ============================================================
   State Management Types
   ============================================================ */

/**
 * Custom fields store state
 */
export interface CustomFieldsState {
  fields: Record<EntityType, CustomField[]>;
  selectedField?: CustomField;
  loading: boolean;
  error?: string;
  entityType?: EntityType;
  unsavedChanges: boolean;
}

/**
 * Custom fields form state
 */
export interface CustomFieldsFormState {
  values: Record<string, any>;
  touched: Record<string, boolean>;
  errors: Record<string, string>;
  isDirty: boolean;
  isSubmitting: boolean;
  isValidating: boolean;
}
