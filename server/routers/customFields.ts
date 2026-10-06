import { Router } from 'express';
import { customFieldsService } from '../services/customFieldsService';
import { validateAuth } from '../middleware/auth';

const router = Router();

/**
 * GET /api/customFields
 * Get all custom fields for an entity type
 * Query params: entityType (required), organizationId (optional, from user context)
 */
router.get('/', validateAuth, async (req, res) => {
  try {
    const { entityType } = req.query;
    
    if (!entityType || typeof entityType !== 'string') {
      return res.status(400).json({ error: 'entityType query parameter is required' });
    }

    // Get organizationId from user context (fallback to 'default' for single-org setups)
    const organizationId = (req as any).user?.organizationId || 'default';

    const fields = await customFieldsService.getFieldsByEntity(organizationId, entityType);
    res.json(fields);
  } catch (error) {
    console.error('Error fetching custom fields:', error);
    res.status(500).json({ error: 'Failed to fetch custom fields' });
  }
});

/**
 * POST /api/customFields
 * Create a new custom field
 * Body: {
 *   entityType: string,
 *   fieldName: string,
 *   fieldLabel: string,
 *   fieldType: 'text' | 'number' | 'date' | 'select' | etc,
 *   fieldDescription?: string,
 *   required?: boolean,
 *   displayOrder?: number,
 *   options?: string[] (for select/multiSelect types)
 * }
 */
router.post('/', validateAuth, async (req, res) => {
  try {
    const organizationId = (req as any).user?.organizationId || 'default';

    const {
      entityType,
      fieldName,
      fieldLabel,
      fieldType,
      fieldDescription,
      required,
      displayOrder,
      options,
    } = req.body;

    // Validate required fields
    if (!entityType || !fieldName || !fieldLabel || !fieldType) {
      return res.status(400).json({
        error: 'Missing required fields: entityType, fieldName, fieldLabel, fieldType',
      });
    }

    // Validate field type
    const validFieldTypes = ['text', 'number', 'date', 'select', 'multiSelect', 'checkbox', 'richText', 'file', 'currency'];
    if (!validFieldTypes.includes(fieldType)) {
      return res.status(400).json({
        error: `Invalid fieldType. Must be one of: ${validFieldTypes.join(', ')}`,
      });
    }

    const field = await customFieldsService.createField({
      organizationId,
      entityType,
      fieldName,
      fieldLabel,
      fieldType,
      fieldDescription,
      required: required || false,
      displayOrder: displayOrder || 0,
      options,
    });

    res.status(201).json(field);
  } catch (error) {
    console.error('Error creating custom field:', error);
    res.status(500).json({ error: 'Failed to create custom field' });
  }
});

/**
 * GET /api/customFields/:id
 * Get a single custom field by ID
 */
router.get('/:id', validateAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const field = await customFieldsService.getField(id);
    if (!field) {
      return res.status(404).json({ error: 'Custom field not found' });
    }

    res.json(field);
  } catch (error) {
    console.error('Error fetching custom field:', error);
    res.status(500).json({ error: 'Failed to fetch custom field' });
  }
});

/**
 * PUT /api/customFields/:id
 * Update a custom field
 * Body: {
 *   fieldLabel?: string,
 *   fieldDescription?: string,
 *   required?: boolean,
 *   displayOrder?: number,
 *   isActive?: boolean,
 *   options?: string[]
 * }
 */
router.put('/:id', validateAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      fieldLabel,
      fieldDescription,
      required,
      displayOrder,
      isActive,
      options,
    } = req.body;

    const field = await customFieldsService.updateField(id, {
      fieldLabel,
      fieldDescription,
      required,
      displayOrder,
      isActive,
      options,
    });

    if (!field) {
      return res.status(404).json({ error: 'Custom field not found' });
    }

    res.json(field);
  } catch (error) {
    console.error('Error updating custom field:', error);
    res.status(500).json({ error: 'Failed to update custom field' });
  }
});

/**
 * DELETE /api/customFields/:id
 * Delete (deactivate) a custom field
 */
router.delete('/:id', validateAuth, async (req, res) => {
  try {
    const { id } = req.params;

    await customFieldsService.deleteField(id);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting custom field:', error);
    res.status(500).json({ error: 'Failed to delete custom field' });
  }
});

/**
 * POST /api/customFields/:id/validate
 * Validate a field value
 * Body: { value: any }
 */
router.post('/:id/validate', validateAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { value } = req.body;

    const result = await customFieldsService.validateValue(id, value);
    res.json(result);
  } catch (error) {
    console.error('Error validating field:', error);
    res.status(500).json({ error: 'Failed to validate field' });
  }
});

/**
 * POST /api/customFields/:id/validations
 * Add validation rule to a custom field
 * Body: {
 *   ruleType: 'required' | 'minLength' | 'maxLength' | 'pattern' | 'range' | 'email' | 'phone',
 *   ruleValue: any,
 *   errorMessage: string
 * }
 */
router.post('/:id/validations', validateAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { ruleType, ruleValue, errorMessage } = req.body;

    if (!ruleType || ruleValue === undefined) {
      return res.status(400).json({
        error: 'Missing required fields: ruleType, ruleValue',
      });
    }

    const validation = await customFieldsService.addValidation(id, {
      ruleType,
      ruleValue,
      errorMessage: errorMessage || '',
    });

    res.status(201).json(validation);
  } catch (error) {
    console.error('Error adding validation:', error);
    res.status(500).json({ error: 'Failed to add validation' });
  }
});

/**
 * GET /api/customFields/:id/validations
 * Get all validation rules for a custom field
 */
router.get('/:id/validations', validateAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const validations = await customFieldsService.getFieldValidations(id);
    res.json(validations);
  } catch (error) {
    console.error('Error fetching validations:', error);
    res.status(500).json({ error: 'Failed to fetch validations' });
  }
});

/**
 * POST /api/customFields/:id/values
 * Save/update a field value for an entity
 * Body: {
 *   entityId: string,
 *   entityType: string,
 *   value: any
 * }
 */
router.post('/:id/values', validateAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { entityId, entityType, value } = req.body;
    const organizationId = (req as any).user?.organizationId || 'default';

    if (!entityId || !entityType) {
      return res.status(400).json({
        error: 'Missing required fields: entityId, entityType',
      });
    }

    const fieldValue = await customFieldsService.setFieldValue({
      customFieldId: id,
      entityId,
      entityType,
      organizationId,
      value,
    });

    res.status(201).json(fieldValue);
  } catch (error: any) {
    console.error('Error setting field value:', error);
    res.status(400).json({ error: error.message || 'Failed to set field value' });
  }
});

/**
 * GET /api/customFields/entity/:entityId
 * Get all field values for an entity
 * Query params: entityType (required)
 */
router.get('/entity/:entityId', validateAuth, async (req, res) => {
  try {
    const { entityId } = req.params;
    const { entityType } = req.query;
    const organizationId = (req as any).user?.organizationId || 'default';

    if (!entityType || typeof entityType !== 'string') {
      return res.status(400).json({ error: 'entityType query parameter is required' });
    }

    const fieldValues = await customFieldsService.getEntityFieldValues(
      organizationId,
      entityId,
      entityType
    );

    res.json(fieldValues);
  } catch (error) {
    console.error('Error fetching entity field values:', error);
    res.status(500).json({ error: 'Failed to fetch entity field values' });
  }
});

export default router;
